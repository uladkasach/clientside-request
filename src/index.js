var qs = {
    stringify : function(obj, prefix) { // https://stackoverflow.com/a/1714899/3068233
        var str = [], p;
        for(p in obj) {
            if (obj.hasOwnProperty(p)) {
                var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                str.push((v !== null && typeof v === "object") ?
                    this.stringify(v, k) :
                    encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }
        }
        return str.join("&");
    }
}


var Request = function(options){
    /*
        cast implicit input to explicit input (e.g., defaults and utility conversions)
    */
    // set defaults
    if(typeof options == "string") options = {uri:options}; // cast uri to options object if options is string
    if(typeof options.method == "undefined") options.method = "GET"; // default to GET
    if(typeof options.cookies == "undefined") options.cookies = true; // default to use cookies; must have cross-origin access
    if(typeof options.json == "undefined") options.json = false; // default to not use json
    if(typeof options.headers == "undefined") options.headers = {}; // create default option to which future defaults will append to

    // append data headers for post requests
    if(options.method == "POST" && options.json === true) options.headers["content-type"] = "application/json"; // if POST and json, add json content header
    if(options.method == "POST" && options.json !== true) options.headers["content-type"] = "application/x-www-form-urlencoded"; // if POST and not json, add form urlencoded (querystring format) content header

    // cast options.data if possible
    if(options.method == "GET" && typeof options.qs == "undefined" && options.data != "undefined") options.qs = options.data; // enable options.data casting to options.qs for GET request; dont overwrite if options.qs is already set
    if(options.method == "POST" && options.json === true && typeof options.body == "undefined" && typeof options.data != "undefined") options.body = options.data; // enable options.data casting to options.body for POST.json request; dont overwrite if options.body is already set
    if(options.method == "POST" && options.json !== true && typeof options.form == "undefined" && typeof options.data != "undefined") options.form = options.data; // enable options.data casting to options.body for POST.form request; dont overwrite if options.form is already set


    /*
        validate input
    */
    // throw rejections when invalid request defined
    if(typeof options.uri != "string") return Promise.reject("options.uri must be a valid uri to which a request should be made");
    if(this.enabled_methods.indexOf(options.method) == -1) return Promise.reject("options.method is invalid; must be in [" + this.enabled_methods.join(",") + "]"); //  invalid method response
    if(typeof options.cookies !== "boolean") return Promise.reject("options.cookies type is invalid; must be boolean"); // invalid cookie toggle
    if(typeof options.json !== "boolean") return Promise.reject("options.json type is invalid; must be boolean"); // invalid json toggle
    if(typeof options.method == "POST" && options.json === true && typeof options.body == "undefined") return Promise.reject("options.body must be defined if method == POST and json === true");
    if(typeof options.method == "POST" && options.json !== true && typeof options.form == "undefined") return Promise.reject("options.form must be defined in method == POST and json !== true");

    // warn user when they are likely making mistakes
    if(typeof options.method == "GET" && typeof options.qs == "undefined" && (typeof options.form != "undefined" || typeof options.body != "undefined")) console.warn("request was made with method GET and form or body was defined, but qs was not. this is likely not intentional.") // warn user


    /*
        define data_string  and query_string
    */
    if(options.method == "POST"){
        query_string = "";
        if(options.json === true) var data_string = JSON.stringify(options.body);
        if(options.json !== true) var data_string = qs.stringify(options.form);
    } else {
        var query_string = qs.stringify(options.qs);
        if(query_string != "") query_string = "?" + query_string;
        var data_string = null;
    }

    /*
        begin request; https://xhr.spec.whatwg.org/
    */
    promise_request = new Promise((resolve, reject)=>{
        var client = new XMLHttpRequest(); // instantiate xhr object
        if(options.cookies === true) client.withCredentials = true; // if cookies are requested, retreive and pass cookies as needed
        client.open(options.method, options.uri + query_string); // open the request
        if(typeof options.headers != "undefined") this.append_headers(client, options.headers); // if headers are defined, append them; client is passed by referece and modified in place
        client.onload = this.return_load_handler(resolve, reject);
        client.onerror = this.return_error_handler(resolve, reject);
        client.send(data_string);
    })

    /*
        easy test; note fails by cross origin
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://google.com", true);
        xhr.onload = function(){ console.log(this.responseText) }
        xhr.onerror = function(error){ console.log("error found:"); console.error(error); }
        xhr.send();
    */

    return promise_request;
};

Request.prototype = {
    enabled_methods : ["GET", "POST"],

    /*
        request helpers
    */
    append_headers : function(client, headers){
        Object.keys(headers).forEach((key)=>{ // append each to the request
            client.setRequestHeader(key, headers[key]);
        });
        // return clients not required as this function modifies by reference
    },

    /*
        error and response handlers
    */
    return_load_handler : function(resolve, reject){
        return function(){
            //console.log(this.status);
            //console.log(this.responseText);
            // note: `this` referes to xhr object
            if(this.status.toString()[0] == "4") return reject({status : this.status, type : "client"}); // 4XX - CLIENT ERROR
            if(this.status.toString()[0] == "5") return reject({status : this.status, type : "server"}); // 5XX - SERVER ERROR
            try {
                response = JSON.parse(this.responseText); // try to parse response as json
            } catch(err) {
                response = this.responseText; // if error, then its not json and just return the response
            }
            resolve(response);
        }
    },
    return_error_handler : function(resolve, reject){
        return function(error){
            // console.log("onerror handler has triggered!");
            // note: `this` referes to xhr object
            if (this.readyState == 4 && this.status == 0) {
                reject({type : "NO_RESPONSE", error : error}); // no server response
            } else {
                reject({type : "UNK", error : error}); // unknown
            }
        }
    }
}



module.exports = function(options){ return new Request(options) }; // generate new request object automatically
