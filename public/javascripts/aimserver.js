'use strict';

var lastResp = null;  // for client side debug
var lastReqURL = null // for client side debug
var lastReq = null;   // for client side debug
var serverURL = "/";
// function AIMServer(serverURL = "/") {
function AIMServer(serverURL) {
    // https://github.com/abdmob/x2js
    var x2jsObj = new X2JS();


    // Initial properties
    this.defaultVersion = 6;
    this.loginSuccess = 0;
    this.token = "";
    this.lastTimestamp = null;
    this.last_api_response = null;
    this.aimURL = serverURL + "api/?";

    this.requestFactory = function (method, version, token, params, api_response_callback) {
        version = (version == null) ? this.defaultVersion : version;
        token = (token == null) ? this.token : token;
        params = (params == null) ? new Object() : params;
        
        var server = this;

        var req = new XMLHttpRequest;
        lastReq = req;
        req.overrideMimeType("text/xml");

        // Handle results
        if (typeof api_response_callback === 'function') {
            req.addEventListener("load", function() {
                lastResp = this;
                var xmlDoc = lastResp.responseXML;
                var api_response = x2jsObj.xml2json(lastResp.responseXML).api_response
                api_response.success = parseInt(api_response.success);
                api_response.version = parseInt(api_response.version);
                api_response.timestamp = Date.parse(api_response.timestamp);
                server.last_api_response = api_response;
                server.lastTimestamp = api_response.timestamp;
                api_response_callback(api_response, server);
                // FOR DEBUG ONLY
                // console.log(api_response);
            });
        }

        // Common parameters
        var _params = {
            'method': method,
            'v': version.toString(),
        };

        // All but login need a token
        if (method != "login") {
            _params.token = token;
        }

        // Remove nulls
        for (var propName in params) { 
            if (params[propName] === null ||params[propName] === undefined) {
                delete params[propName];
            }
        }

        // https://github.com/stretchr/arg.js
        var url = Arg.url(server.aimURL, Object.assign({}, _params, params));

        lastReqURL = url;
        req.open("GET", url);
        return req;
    }

    this.login = function (username, password, version, callback) {
        version = 4;
        callback = (typeof callback === 'function') ? callback : function() {};
        var params = {
            "username": username,
            "password": password
        };

        this.requestFactory("login", version, null, params, function(api_response, server){
            server.loginSuccess = api_response.success;
            server.token = "";

            if (api_response.success == 1) {
                server.token = api_response.token;
                callback(api_response.success, api_response.version, api_response.timestamp, null, api_response.token);
            } else {
                callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
            }    
        }).send();
    }

    this.logout = function (token, version, callback) {
        callback = (typeof callback === 'function') ? callback : function() {};

        var params = {};

        this.requestFactory("logout", version, token, params, function(api_response, server) {
            if (api_response.success == 1) {
                server.loginSuccess = 0;
                server.token = "";
                callback(api_response.success, api_response.version, api_response.timestamp, null);
            } else {
                callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
            }
        }).send();
    }

    this.get_devices = function (token, version, device_type, filter_d_name, filter_d_description, filter_d_location, sort, sort_dir, status, show_all, page, results_per_page, callback) {
        callback = (typeof callback === 'function') ? callback : function() {};

        var params = {
            'device_type': device_type,
            'filter_d_name': filter_d_name,
            'filter_d_description': filter_d_description,
            'filter_d_location': filter_d_location,
            'sort': sort,
            'sort_dir': sort_dir,
            'status': status,
            'show_all': show_all,
            'page': page,
            'results_per_page': results_per_page
        };

        this.requestFactory("get_devices", version, token, params, function(api_response) {
            if(api_response.success == 1) {
                var results = new Object();
                if (parseInt(api_response.count_devices) > 0) {
                    results = api_response.devices.device;
                }               
                callback(api_response.success, api_response.version, api_response.timestamp, null, parseInt(api_response.page), parseInt(api_response.results_per_page), parseInt(api_response.total_devices), parseInt(api_response.count_devices), results);
            } else {
                callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
            }
        }).send();
    }

    this.get_channels = function(token, version, page, results_per_page, device_id, filter_c_name, filter_c_description, filter_c_location, filter_favourites, callback) {
        callback = (typeof callback === 'function') ? callback : function() {};

        var params = {
            'page': page,
            'results_per_page': results_per_page,
            'device_id': device_id,
            'filter_c_name': filter_c_name,
            'filter_c_description': filter_c_description,
            'filter_c_location': filter_c_location,
            'filter_favourites': filter_favourites
        }

        this.requestFactory("get_channels", version, token, params, function(api_response) {
            if(api_response.success == 1) {
                var results = new Object();
                if (parseInt(api_response.count_channels) > 0) {
                    results = api_response.channels.channel;
                }
                callback(api_response.success, api_response.version, api_response.timestamp, null, parseInt(api_response.page), parseInt(api_response.results_per_page), parseInt(api_response.count_channels), results);
            } else {
                callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
            }
        }).send();
    }

    // callback(success, version, timestamp, erros, page, results_per_page, total_presets, count_presets, presets)
    this.get_presets = function(token, version, page, results_per_page, callback) {
        callback = (typeof callback === 'function') ? callback : function() {};

        var params = {
            'page': page,
            'results_per_page': results_per_page,
        }

        this.requestFactory("get_presets", version, token, params, function(api_response) {
            if(api_response.success == 1) {
                var results = new Object();
                if (parseInt(api_response.count_presets) > 0) {
                    results = api_response.connection_presets.connection_preset;
                }
                callback(api_response.success, api_response.version, api_response.timestamp, null, parseInt(api_response.page), parseInt(api_response.results_per_page), parseInt(api_response.total_presets), parseInt(api_response.count_presets), results);
            } else {
                callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
            }
        }).send();
    }

    this.connect_channel = function(token, version, c_id, rx_id, view_only, exclusive, callback) {
        callback = (typeof callback === 'function') ? callback : function() {};

        var params = {
            'c_id': c_id,
            'rx_id': rx_id,
            'view_only': view_only,
            'exclusive': exclusive
        }

        this.requestFactory("connect_channel", version, token, params, function(api_response) {
            if(api_response.success == 1) {
                callback(api_response.success, api_response.version, api_response.timestamp, null);
            } else {
                callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
            }
        }).send();
    }

    this.connect_preset = function(token, version, id, view_only, exclusive, force, callback) {
        callback = (typeof callback === 'function') ? callback : function() {};

        var params = {
            'id': id,
            'view_only': view_only,
            'exclusive': exclusive,
            'force': force
        }

        this.requestFactory("connect_preset", version, token, params, function(api_response) {
            if(api_response.success == 1) {
                callback(api_response.success, api_response.version, api_response.timestamp, null);
            } else {
                callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
            }
        }).send();
    }

    this.disconnect_channel = function(token, version, rx_id, force, callback) {
        callback = (typeof callback === 'function') ? callback : function() {};

        var params = {
            'rx_id': rx_id,
            'force': force
        }

        this.requestFactory("disconnect_channel", version, token, params, function(api_response) {
            if(api_response.success == 1) {
                callback(api_response.success, api_response.version, api_response.timestamp, null);
            } else {
                callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
            }
        }).send();
    }

    this.disconnect_preset = function(token, version, id, force, callback) {
        callback = (typeof callback === 'function') ? callback : function() {};

        var params = {
            'id': id,
            'force': force
        }

        this.requestFactory("disconnect_preset", version, token, params, function(api_response) {
            if(api_response.success == 1) {
                callback(api_response.success, api_response.version, api_response.timestamp, null);
            } else {
                callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
            }
        }).send();
    }

    this.create_preset = function(token, version, name, pairs, allowed, callback) {
        callback = (typeof callback === 'function') ? callback : function() {};

        var params = {
            'name': name,
            'pairs': pairs,
            'allowed': allowed
        }

        this.requestFactory("create_preset", version, token, params, function(api_response) {
            if(api_response.success == 1) {
                callback(api_response.success, api_response.version, api_response.timestamp, null, parseInt(api_response.id));
            } else {
                callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors, null);
            }
        }).send();
    }

    this.delete_preset = function(token, version, id, callback) {
        callback = (typeof callback === 'function') ? callback : function() {};

        var params = {
            'id': id
        }

        this.requestFactory("delete_preset", version, token, params, function(api_response) {
            if(api_response.success == 1) {
                callback(api_response.success, api_response.version, api_response.timestamp, null);
            } else {
                callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
            }
        }).send();
    }

    this.create_channel = function(token, version, name, desc, loc, allowed, video1, video1head, video2, video2head, audio, usb, serial, groupname, callback) {
        callback = (typeof callback === 'function') ? callback : function() {};

        var params = {
            "name": name, 
            "desc": desc, 
            "loc": loc, 
            "allowed": allowed, 
            "video1": video1, 
            "video1head": video1head, 
            "video2": video2, 
            "video2head": video2head, 
            "auido": audio, 
            "usb": usb, 
            "serial": serial, 
            "groupname": groupname
        }

        this.requestFactory("create_channel", version, token, params, function(api_response) {
            if(api_response.success == 1) {
                callback(api_response.success, api_response.version, api_response.timestamp, null, parseInt(api_response.id));
            } else {
                callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors, null);
            }
        }).send();
    }

    this.delete_channel = function(token, version, id, callback) {
        callback = (typeof callback === 'function') ? callback : function() {};

        var params = {
            'id': id
        }

        this.requestFactory("delete_channel", version, token, params, function(api_response) {
            if(api_response.success == 1) {
                callback(api_response.success, api_response.version, api_response.timestamp, null);
            } else {
                callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
            }
        }).send();
    }

    this.update_device = function(token, version, id, desc, loc, callback) {
        callback = (typeof callback === 'function') ? callback : function() {};

        var params = {
            'id': id,
            "desc": desc,
            "loc": loc
        }

        this.requestFactory("update_device", version, token, params, function(api_response) {
            if(api_response.success == 1) {
                callback(api_response.success, api_response.version, api_response.timestamp, null);
            } else {
                callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
            }
        }).send();
    }

    this.get_all_c_usb = function(token, version, callback) {
        callback = (typeof callback === 'function') ? callback : function() {};

        var params = {
        }

        this.requestFactory("get_all_c_usb", version, token, params, function(api_response) {
            if(api_response.success == 1) {
                var results = new Object();
                if (parseInt(api_response.count_c_usbs) > 0) {
                    results = api_response.c_usb_lan_extenders.c_usb;
                }
                callback(api_response.success, api_response.version, api_response.timestamp, null, parseInt(api_response.count_c_usbs), results);
            } else {
                callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
            }
        }).send();
    }

    this.delete_c_usb = function(token, version, mac, callback) {
        callback = (typeof callback === 'function') ? callback : function() {};

        var params = {
            'mac': mac
        }

        this.requestFactory("delete_c_usb", version, token, params, function(api_response) {
            if(api_response.success == 1) {
                callback(api_response.success, api_response.version, api_response.timestamp, null);
            } else {
                callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
            }
        }).send();
    }

    this.update_c_usb = function(token, version, mac, name, callback) {
        callback = (typeof callback === 'function') ? callback : function() {};

        var params = {
            'mac': mac,
            "name": name
        }

        this.requestFactory("update_c_usb", version, token, params, function(api_response) {
            if(api_response.success == 1) {
                callback(api_response.success, api_response.version, api_response.timestamp, null);
            } else {
                callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
            }
        }).send();
    }

    this.connect_c_usb = function(token, version, rx, tx, callback) {
        callback = (typeof callback === 'function') ? callback : function() {};

        var params = {
            'rx': rx,
            'tx': tx
        }

        this.requestFactory("connect_c_usb", version, token, params, function(api_response) {
            if(api_response.success == 1) {
                callback(api_response.success, api_response.version, api_response.timestamp, null);
            } else {
                callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
            }
        }).send();
    }

    this.disconnect_c_usb = function(token, version, mac, callback) {
        callback = (typeof callback === 'function') ? callback : function() {};

        var params = {
            'mac': mac
        }

        this.requestFactory("disconnect_c_usb", version, token, params, function(api_response) {
            if(api_response.success == 1) {
                callback(api_response.success, api_response.version, api_response.timestamp, null);
            } else {
                callback(api_response.success, api_response.version, api_response.timestamp, api_response.errors);
            }
        }).send();
    }
}