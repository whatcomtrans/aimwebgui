
var workspace = new AIMServer(serverURL);
var init = false;

/*
server.refresh_collections = function() {
    var s = this;
    this.get_devices(null, null, 'rx', null ,null,null,null,null,null,null,null,null, function(success, version, timestamp, errors, page, results_per_page, total_devices, count_devices, devices){
        s.receivers = devices;
    });
    this.get_channels(null,null,null,null,null,null,null,null,null, function(success, version, timestamp, errors, page, results_per_page, count_channels, channels){
        s.channels = channels;
    });
    this.get_presets(null,null,null,null, function(success, version, timestamp, errors, page, results_per_page, total_presets, count_presets, presets){
        s.presets = presets;
    });
}
*/


// CustomEvent polyfill, see https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
(function () {

  if ( typeof window.CustomEvent === "function" ) return false;

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }
   console.log(CustomEvent);
   console.log(typeof CustomEvent);
  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();


workspace.emitEvent = function(type, detail) {
    var event = new CustomEvent(type, {
        "detail": detail
    });
    dispatchEvent(event);
};

workspace.CHANNELCHANGED = "CHANNELCHANGED";

workspace.getReceiverByID = function(receiverId) {
    return workspace.receivers.find(function(rx) {
        return rx.d_id === receiverId;
    });
}

workspace.getChannelsByName = function(channelName) {
    return workspace.channels.find(function(channel) {
        return channel.c_name === channelName;
    });
}

//wasnt working so i wrote around it, dont need this anymore
workspace.swap = function(receiverOneId, receiverTwoId) {
    // Get the current channel of each receiver and change the channel on each
    
    if (workspace.receivers.length > 0) {
        // We actually have some receivers
        var receiverOneChannelId = workspace.getChannelsByName(workspace.getReceiverByID(receiverOneId).c_name).c_id;
        var receiverTwoChannelId = workspace.getChannelsByName(workspace.getReceiverByID(receiverTwoId).c_name).c_id;

        workspace.changeChannel(receiverOneId, receiverTwoChannelId);
        workspace.changeChannel(receiverTwoId, receiverOneChannelId);
    }
}

workspace.changeChannel = function(receiverId, channelId) {
    // Change the channel of a specific receiver

    workspace.connect_channel(null, null, channelId, receiverId, null, null, function() {
        // Emit channelChanged event, after we have refreshed lists
        workspace.get(function(success) {
            workspace.emitEvent(workspace.CHANNELCHANGED, true);
        });
    });
}

workspace.changePreset = function(presetId) {
    // Change to a preset
    for (var i=0;i<presets.length;i++) {
        if (presetId==presets[i].cp_id) {
            preset = presets[i];
        }
    }
    workspace.connect_preset(null, null, presetId, null, 1, function() {
        // Emit channelChanged event, after we have refreshed lists
        workspace.get(function(success) {
            workspace.emitEvent(workspace.CHANNELCHANGED, true);
        });
    });
}

workspace.LOADED = "LOADED";

workspace.load = function(username, password, callback) {
    callback = (typeof callback === 'function') ? callback : function() {};
    // Login
    workspace.login(username, password, null, function(success) {
        if (success) {
            // Setup polling and/or listeners
            // Pull down list of recievers, channels and presets
            setInterval(workspace.get, 1000 * 1);  // TODO what is the correct timing for this?
            workspace.get(function() {
                if (success) {
                    workspace.emitEvent(workspace.LOADED, channels);
                }
            });
            callback(success);
        } else {
            console.log("Error with login");
            alert(username + ' ' + password + ' ' + window.location.href);
            // TODO, what else should happen here
            callback(success);
        }
    });
    
}

workspace.CHANNELSLISTREADY = "CHANNELSLISTREADY";
workspace.PRESETSLISTREADY = "PRESETSLISTREADY";
workspace.RECEIVERLISTREADY = "RECEIVERLISTREADY";

workspace.get = function(callback) {
    callback = (typeof callback === 'function') ? callback : function() {};
    // Emit channelsReady with array of channels
    workspace.get_channels(null, null, null, null, null, null, null, null, null, function(success, version, timestamp, errors, page, results_per_page, count_channels, channels){
        if (success) {
            workspace.channels = channels;
            workspace.emitEvent(workspace.CHANNELSLISTREADY, channels);
            callback(success, channels);
        } else {
            console.log("Error with get_channels");
            // TODO, what else should happen here
            callback(success);
        }
    });
    
    // Emit presetsReady with array of presets
    workspace.get_presets(null,null,null,null, function(success, version, timestamp, errors, page, results_per_page, total_presets, count_presets, presets){
        if (success) {
            workspace.presets = presets;
            workspace.emitEvent(workspace.PRESETSLISTREADY, presets);
            callback(success, presets);
        } else {
            console.log("Error with get_presets");
            // TODO, what else should happen here
            callback(success);
        }
    });

    // Emit receiversReady with array of receivers
    workspace.get_devices(null, null, 'rx', null ,null,null,null,null,null,null,null,null, function(success, version, timestamp, errors, page, results_per_page, total_devices, count_devices, devices){
        if (success) {
            // TODO Add channel details
            // workspace.getChannelsByName(receiver.c_name)
            devices.forEach(function callback(receiver, index, array) {
                receiver.channel = workspace.getChannelsByName(receiver.c_name);
            });
            workspace.receivers = devices;
            workspace.emitEvent(workspace.RECEIVERLISTREADY, devices);
            callback(success, receivers);
        } else {
            console.log("Error with get_devices");
            // TODO, what else should happen here
            callback(success);
        }
    });
}

// Note, this just update the global variables.  Prior to the event being called,
// the workspace.channels, workspace.presets, workspace.recivers is updated too.

addEventListener(workspace.CHANNELSLISTREADY, function(e){
    channels = e.detail;
    initCheck();
    updateChannels();
});

addEventListener(workspace.PRESETSLISTREADY, function(e){
    presets = e.detail;
    initCheck();
    updatePresets();
});

addEventListener(workspace.RECEIVERLISTREADY, function(e){
    receivers = e.detail;
    initCheck();
    updateMonitors();
});

addEventListener(workspace.CHANNELCHANGED, function(e) {
    console.log(e);
    updateMonitors();
});

function initCheck() {
    if (channels&&presets&&receivers&&!init) {
        init = true;
        initPage();
    }
}

// Login

var userId = getUrlParams().id;
if (userId === undefined) {
    userId = "d1"
}
console.log(userId);

var userPassword = getUrlParams().password;
if (userPassword === undefined) {
    userPassword = "de5eccab28"
}
console.log(userPassword);

workspace.load(userId, userPassword);

function getUrlParams(url) {
    // https://www.sitepoint.com/get-url-parameters-with-javascript/

  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.href.split('?').slice(1)[0];
  // var queryString = url ? url.split('/').pop() : window.location.href.split('/').pop();

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i=0; i<arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // in case params look like: list[]=thing1&list[]=thing2
      var paramNum = undefined;
      var paramName = a[0].replace(/\[\d*\]/, function(v) {
        paramNum = v.slice(1,-1);
        return '';
      });

      // set parameter value (use 'true' if empty)
      var paramValue = typeof(a[1])==='undefined' ? true : a[1];

      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
      paramValue = paramValue.toLowerCase();

      // if parameter name already exists
      if (obj[paramName]) {
        // convert value to array (if still string)
        if (typeof obj[paramName] === 'string') {
          obj[paramName] = [obj[paramName]];
        }
        // if no array index number specified...
        if (typeof paramNum === 'undefined') {
          // put the value on the end of the array
          obj[paramName].push(paramValue);
        }
        // if array index number specified...
        else {
          // put the value at that index number
          obj[paramName][paramNum] = paramValue;
        }
      }
      // if param name doesn't exist yet, set it
      else {
        obj[paramName] = paramValue;
      }
    }
  }

  return obj;
}