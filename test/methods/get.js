var module_path = "file:///var/www/git/More/clientside-request/src/index.js";
var clientside_require = require("clientside-require");
var assert = require('assert');

describe('GET', function(){
    it("should be able to send a GET reqeust and retreive data", async function(){
        var request = await clientside_require.asynchronous_require(module_path);
        var response = await request("google.com");
        console.log(request);
    })
    it("should be able to set querystring parameters accurately")
})
