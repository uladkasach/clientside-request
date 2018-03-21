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
        normalize and validate the options
    */
    var options = this.normalize_options(options)
    var [validity, error] = this.validate_options(options);
    if(validity !== true) return Promise.reject(error); // if validity is not === `true`, return the error

    /*
        build and send request
    */
    var [query_string, data_string] = this.extract_query_and_data_from_options(options);
    var promise_request = this.promise_request(options.method, options.uri, options.headers, options.cookies, query_string, data_string);

    /*
        return response promise
    */
    return promise_request;
}

Request.prototype = {
    enabled_methods : ["GET", "POST"],

    /*
        build and send request
    */
    promise_request : function(method, uri, headers, cookies, query_string, data_string){
        // begin request; https://xhr.spec.whatwg.org/
        return new Promise((resolve, reject)=>{
            var client = new XMLHttpRequest(); // instantiate xhr object
            if(cookies === true) client.withCredentials = true; // if cookies are requested, retreive and pass cookies as needed
            client.open(method, uri + query_string); // open the request
            if(typeof headers != "undefined") this.append_headers(client, headers); // if headers are defined, append them; client is passed by referece and modified in place
            client.onload = this.return_load_handler(resolve, reject);
            client.onerror = this.return_error_handler(resolve, reject);
            client.send(data_string);
            client.uri = uri; // so that onload handler can access uri
        })
    },
    extract_query_and_data_from_options : function(options){
        // define data_string  and query_string
        if(options.method == "POST"){
            query_string = "";
            if(options.json === true) var data_string = JSON.stringify(options.body);
            if(options.json !== true) var data_string = qs.stringify(options.form);
        }
        if(options.method == "GET"){
            var query_string = qs.stringify(options.qs);
            if(query_string != "") query_string = "?" + query_string;
            var data_string = null;
        }

        // return result
        return [query_string, data_string];
    },



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
            /*
                detect errors
            */
            if(this.status.toString()[0] == "4"){ // 4XX - CLIENT ERROR
                var error = new Error("4XX - CLIENT ERROR - " + this.status + " - " + this.uri);
                error.code = this.status; // append status code as error code
                error.type = "CLIENT"; // since of client type
                return reject(error);
            }
            if(this.status.toString()[0] == "5"){ // 5XX - SERVER ERROR
                var error = new Error("5XX - SERVER ERROR - " + this.status + " - " + this.uri);
                error.code = this.status; // append status code as error code
                error.type = "SERVER"; // since of client type
                return reject(error);
            }

            /*
                attempt to cast string to json
                    - if failed, then just return string
            */
            try {
                response = JSON.parse(this.responseText); // try to parse response as json
            } catch(err) {
                response = this.responseText; // if error, then its not json and just return the response
            }

            /*
                resolve with response
            */
            resolve(response);
        }
    },
    return_error_handler : function(resolve, reject){
        return function(original_error){
            var xhr_object = this; // this referes to the xhr object since the xhr object is assigned this function

            /*
                create custom error and append original error
            */
            var custom_error = new Error();
            custom_error.original_error = original_error;

            /*
                detect if we can provide more information
            */
            if (xhr_object.readyState == 4 && xhr_object.status == 0) { // no server response
                custom_error.code = "NO_RESPONSE";
                custom_error.type = "CONNECTION";
            } else { // unknown error
                custom_error.code = "UNKNOWN";
                custom_error.type = "CONNECTION";
            }

            /*
                append error message
            */
            var message_artifact = (original_error.message)? " - " + original_error.message : "";
            custom_error.message = custom_error.type // display type
                + " - " + custom_error.code // code
                + message_artifact; // pass along original_error message if it exists

            /*
                resolve with response
            */
            return reject(custom_error);
        }
    },


    /*
        request analysis
    */
    normalize_options : function(options){
        /*
            cast implicit input to explicit input (e.g., defaults and utility conversions)
        */
        // set defaults
        if(typeof options == "undefined") options = {};
        if(typeof options == "string") options = {uri:options}; // cast uri to options object if options is string
        if(typeof options.method == "undefined") options.method = "GET"; // default to GET
        if(typeof options.cookies == "undefined") options.cookies = false; // default to not use cookies; when cookies are true, must have cross-origin access
        if(typeof options.json == "undefined") options.json = false; // default to not use json
        if(typeof options.headers == "undefined") options.headers = {}; // create default option to which future defaults will append to

        // append data headers for post requests
        if(options.method == "POST" && options.json === true) options.headers["content-type"] = "application/json"; // if POST and json, add json content header
        if(options.method == "POST" && options.json !== true) options.headers["content-type"] = "application/x-www-form-urlencoded"; // if POST and not json, add form urlencoded (querystring format) content header

        // cast options.data if possible
        if(options.method == "GET"
            && typeof options.qs == "undefined"
            && options.data != "undefined") options.qs = options.data; // enable options.data casting to options.qs for GET request; dont overwrite if options.qs is already set
        if(options.method == "POST"
            && options.json === true
            && typeof options.body == "undefined"
            && typeof options.data != "undefined") options.body = options.data; // enable options.data casting to options.body for POST.json request; dont overwrite if options.body is already set
        if(options.method == "POST"
            && options.json !== true
            && typeof options.form == "undefined"
            && typeof options.data != "undefined") options.form = options.data; // enable options.data casting to options.body for POST.form request; dont overwrite if options.form is already set

        // return result;
        return options;
    },
    validate_options : function(options){
        /*
            validate input
        */
        // return error message when invalid request defined
        if(typeof options.uri != "string") var error = this.generate_validity_error("URI", "options.uri must be a valid uri to which a request should be made");
        if(this.enabled_methods.indexOf(options.method) == -1) var error = this.generate_validity_error("METHOD", "options.method is invalid; must be in [" + this.enabled_methods.join(",") + "]"); //  invalid method response
        if(typeof options.cookies !== "boolean") var error = this.generate_validity_error("COOKIES", "options.cookies type is invalid; must be boolean"); // invalid cookie toggle
        if(typeof options.json !== "boolean") var error = this.generate_validity_error("JSON","options.json type is invalid; must be boolean"); // invalid json toggle
        if(options.method == "POST"
            && options.json === true
            && typeof options.body == "undefined") var error = this.generate_validity_error("BODY", "options.body must be defined if method == POST and json === true");
        if(options.method == "POST"
            && options.json !== true
            && typeof options.form == "undefined") var error = this.generate_validity_error("FORM", "options.form must be defined in method == POST and json !== true");

        // evaluate if error was created and resolve with error if it was
        if(typeof error !== "undefined") return [false, error]

        // warn user when they are likely making mistakes
        if(typeof options.method == "GET" && typeof options.qs == "undefined" && (typeof options.form != "undefined" || typeof options.body != "undefined")) console.warn("request was made with method GET and form or body was defined, but qs was not. this is likely not intentional.") // warn user

        // if we reach here, then input is valid. reponspond with "true"
        return [true, null];
    },
    generate_validity_error : function(type, message){
        var error = new Error(message);
        error.type = type;
        return error;
    },


}

module.exports = Request;
