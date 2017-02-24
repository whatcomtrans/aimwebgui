var aimURL = "/api/?";
var lastResp = null;  // for client side debug
var lastReq = null;   // for client side debug


var server = new Object();
server.loginSuccess = 0;
server.token = "";

server.login = function (username, password, callback) {
    callback = (typeof callback === 'function') ? callback : function() {};
    req = new XMLHttpRequest;
    lastReq = req;
    req.overrideMimeType("text/xml");
    req.addEventListener("load", function(){
        lastResp = this;
        var xmlDoc = this.responseXML;
        var version = "";
        var timestamp = "";
        var errors = null;
        var token = xmlDoc.getElementsByTagName("token").item(0).innerHTML;
        var success = parseInt(xmlDoc.getElementsByTagName("success").item(0).innerHTML);
        document.getElementById("output").value = this.responseText;
        document.getElementById("token").value = server.token;

        server.loginSuccess = success;
        server.token = token;

        callback(errors; success, token, version, timestamp);
    });
    var url = aimURL + "method=login&username=" + username + "&password=" + password + "&v=1";
    document.getElementById("output").value = url;
    req.open("GET", url);
    req.send();
}

server.get_devices