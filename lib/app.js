var server = new AIMServer();

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

