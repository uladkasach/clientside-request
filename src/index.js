var qs = require("qs");

var Request = function(options){
    console.log(options);
    /*
        cast implicit input to explicit input (e.g., defaults and utility conversions)
    */
    // set defaults
    if(typeof options == "string") options = {uri:options}; // cast uri to options object if options is string
    if(typeof options.method == "undefined") options.method = "GET"; // default to GET
    if(typeof options.cookies == "undefined") options.cookies = true; // default to use cookies
    if(typeof options.headers == "undefined") options.headers = {}; // create default option to which future defaults will append to

    // append data headers for post requests
    if(options.method == "POST" && options.json === true) headers.options["content-type"] = "application/json;charset=UTF-8"; // if POST and json, add json content header
    if(options.method == "POST" && options.json !== true) headers.options["content-type"] = "application/x-www-form-urlencoded"; // if POST and not json, add form urlencoded (querystring format) content header

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
    if(typeof options.method == "POST" && options.json === true && typeof options.body == "undefined") return Promise.reject("options.body must be defined if method == POST and json === true");
    if(typeof options.method == "POST" && options.json !== true && typeof options.form == "undefined") return Promise.reject("options.form must be defined in method == POST and json !== true");

    // warn user when they are likely making mistakes
    if(typeof options.method == "GET" && typeof options.qs == "undefined" && (typeof options.form != "undefined" || typeof options.body != "undefined")) console.warn("request was made with method GET and form or body was defined, but qs was not. this is likely not intentional.") // warn user


    console.log("here i am");

    /*
        begin request; https://xhr.spec.whatwg.org/
    */

    query_string = qs.stringify(options.qs);
    console.log(query_string);
    var client = new XMLHttpRequest(); // instantiate xhr object
    if(options.cookies) client.withCredentials = true; // if cookies are requested, retreive and pass cookies as needed
    if(typeof options.headers != "undefined") this.append_headers(client, options.headers); // if headers are defined, append them; client is passed by referece and modified in place
    client.open(options.method, options.uri + query_string); // open the request



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
        requests
    */
    POST : function(uri, data){
        return promise_data
            .then((data)=>{
                return new Promise((resolve, reject)=>{
                    var xhr = new XMLHttpRequest();
                    xhr.withCredentials = true;
                    xhr.open("POST", uri, true);
                    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    xhr.onload = this.return_load_handler(resolve, reject);
                    xhr.onerror = this.return_error_handler(resolve, reject);
                    xhr.send(data);
                })
            });
    },
    GET : function(uri, data){

        var promise_data = require("qs") // promise to parse data
            .then((qs)=>{
                if(typeof data == "object") data = qs.stringify(data); // stringify the data
                return data;
            });
        return promise_data
            .then((data)=>{
                return new Promise((resolve, reject)=>{
                    var xhr = new XMLHttpRequest();
                    xhr.withCredentials = true;
                    xhr.open("GET", uri + "?" + data, true);
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
        return function(error){
            // console.log("onerror handler has triggered!");
            /*
            // note: `this` referes to xhr object
            if (this.readyState == 4 && this.status == 0) {
                alert("Server response not received. Are you sure you're connected to the internet?");
            } else {
                alert("An unknown error has occured. Please reload the page or contact us for help!");
            }
            reject({type : "CONNECTION"});
            */
            reject(error);
        }
    }
}



module.exports = function(options){ return new Request(options) }; // generate new request object automatically
