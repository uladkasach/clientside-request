var promise_qs = require("qs");

var promise_request = require("clientside-request");

var API_Interface = function(host){
    if(host.slice(-1) !== "/") host += "/"; // append "/" if it is not already there
    this.host = host; // expects http/https (protocol), domain name, port(default is 80) - full path to server.
}

API_Interface.prototype = {
    /*
        requests
    */
    post : function(route, data){
        if(route[0] == "/") route = route.substring(1); // remove leading "/" if it is given
        var promise_data = promise_qs // promise to parse data
            .then((qs)=>{
                if(typeof data == "object") data = qs.stringify(data); // stringify the data
                return data;
            });
        return promise_data
            .then((data)=>{
                return new Promise((resolve, reject)=>{
                    var xhr = new XMLHttpRequest();
                    xhr.withCredentials = true;
                    xhr.open("POST", this.host + route, true);
                    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    xhr.onload = this.return_load_handler(resolve, reject);
                    xhr.onerror = this.return_error_handler(resolve, reject);
                    xhr.send(data);
                })
            });
    },
    get : function(route, data){
        if(route[0] == "/") route = route.substring(1); // remove leading "/" if it is given
        var promise_data = promise_qs // promise to parse data
            .then((qs)=>{
                if(typeof data == "undefined") data = "";
                if(typeof data == "object") data = qs.stringify(data); // stringify the data
                if(data !== "" && data[0] !== "?") data = "?" + data;  // cleanse get data
                return data;
            });
        return promise_data
            .then((data)=>{
                return new Promise((resolve, reject)=>{
                    var xhr = new XMLHttpRequest();
                    xhr.withCredentials = true;
                    xhr.open("GET", this.host + route + data, true);
                    xhr.onload = this.return_load_handler(resolve, reject);
                    xhr.onerror = this.return_error_handler(resolve, reject);
                    xhr.send();
                })
            });
    },

    /*
        error and response handlers
    */
    return_load_handler : function(resolve, reject){
        return function(){
            //console.log(this.status);
            //console.log(this.responseText);
            // note: `this` referes to xhr object
            if(this.status == "401") return reject({type : "401"}); // UNAUTHORIZED - https://httpstatuses.com/401
            if(this.status == "403") return reject({type : "403"}); // FORBIDDEN - https://httpstatuses.com/403
            if(this.status == "412") return reject({type : "412"}); // PRECONDITION FAILED - https://httpstatuses.com/412
            try {
                response = JSON.parse(this.responseText); // try to parse response as json
            } catch(err) {
                response = this.responseText; // if error, then its not json and just return the response
            }
            resolve(response);
        }
    },
    return_error_handler : function(resolve, reject){
        return function(){
            // console.log("onerror handler has triggered!");
            // note: `this` referes to xhr object
            if (this.readyState == 4 && this.status == 0) {
                alert("Server response not received. Are you sure you're connected to the internet?");
            } else {
                alert("An unknown error has occured. Please reload the page or contact us for help!");
            }
            reject({type : "CONNECTION"});
        }
    }
}


module.exports = new API_Interface(window.location.origin + ":3821");

