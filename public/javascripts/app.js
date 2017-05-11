var workspace = new AIMServer();

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
        worspace.get(function(success) {
            workspace.emitEvent(workspace.CHANNELCHANGED, true);
        });
    });
}

workspace.changePreset = function(presetId) {
    // Change to a preset
    workspace.connect_preset(null, null, presetId, null, 1, function() {
        // Emit channelChanged event, after we have refreshed lists
        worspace.get(function(success) {
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
            setInterval(workspace.get, 1000 * 5);  // TODO what is the correct timing for this?
            workspace.get(function() {
                if (success) {
                    workspace.emitEvent(workspace.LOADED, channels);
                }
            });
            callback(success);
        } else {
            console.log("Error with login");
            // TODO, what else should happen here
            callback(success);
        }
    });
    
}

workspace.CHANNELSLISTREADY = "CHANNELSLISTREADY";
workspace.PRESETSLISTREADY = "PRESETSLISTREADY";
workspace.RECEIVERLISTREADY = "RECEIVERLISTREADY"

workspace.get = function(callback) {
    callback = (typeof callback === 'function') ? callback : function() {};
    // Emit channelsReady with array of channels
    workspace.get_channels(null, null, null, null, null, null, null, null, function(success, version, timestamp, errors, page, results_per_page, count_channels, channels){
        if (success) {
            workspace.channels = channels;
            workspace.emitEvent(workspace.CHANNELSREADY, channels);
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
            workspace.emitEvent(workspace.PRESETSREADY, presets);
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
// the workspace.channels, workspace.presets, workspace.recivers is updates too.
// Instead of using the globals, consider using the workspace members?

addEventListener(workspace.CHANNELSREADY, function(e){
    channels = e.detail;
});

addEventListener(workspace.PRESETSREADY, function(e){
    presets = e.detail;
});

addEventListener(workspace.RECEIVERLISTREADY, function(e){
    receivers = e.detail;
    // TODO Update screen with channel descriptions using c_description
});

workspace.load("D1", "password");