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


workspace.swap = function(receiverIdOne, receiverIdTwo) {
    // Get the current channel of each receiver and change the channel on each
    var wks = this;

    if (wks.receivers.length > 0) {
        // We actually have some receivers
        
    }

    // Emit channelChanged event
    var event = new CustomEvent("channelChanged", {
        detail: true
    });
    wks.dispatchEvent(event);
}

workspace.changeChannel = function(receiverId, channelId) {
    // Change the channel of a specific receiver
    var wks = this;
    // Emit channelChanged event
    var event = new CustomEvent("channelChanged", {
        detail: true
    });
    wks.dispatchEvent(event);

}

workspace.load = function(username, password) {
    var wks = this;
    // Login
    wks.login(username, password, null, function(success) {
        if (success) {
            // Setup polling and/or listeners
            // Pull down list of recievers, channels and presets
            setInterval(wks.get, 1000 * 5);
            wks.get();
            var event = new CustomEvent("loaded", {
                detail: channels
            });
            wks.dispatchEvent(event);
        } else {
            console.log("Error with login");
            // TODO, what else should happen here
        }
    });
    
}

workspace.get = function() {
    // Emit channelsReady with array of channels
    wks.get_channels(null, null, null, null, null, null, null, null, function(success, version, timestamp, errors, page, results_per_page, count_channels, channels){
        if (success) {
            wks.channels = channels;
            var event = new CustomEvent("channelsReady", {
                detail: channels
            });
            wks.dispatchEvent(event);
        } else {
            console.log("Error with get_channels");
            // TODO, what else should happen here
        }
    });
    
    // Emit presetsReady with array of presets
    wks.get_presets(null,null,null,null, function(success, version, timestamp, errors, page, results_per_page, total_presets, count_presets, presets){
        if (success) {
            wks.presets = presets;
            var event = new CustomEvent("presetsReady", {
                detail: presets
            });
            wks.dispatchEvent(event);
        } else {
            console.log("Error with get_presets");
            // TODO, what else should happen here
        }
    });

    // Emit receiversReady with array of receivers
    wks.get_devices(null, null, 'rx', null ,null,null,null,null,null,null,null,null, function(success, version, timestamp, errors, page, results_per_page, total_devices, count_devices, devices){
        if (success) {
            wks.receivers = devices;
            var event = new CustomEvent("receiversReady", {
                detail: devices
            });
            wks.dispatchEvent(event);
        } else {
            console.log("Error with get_devices");
            // TODO, what else should happen here
        }
    });
}