var module_path = "file:///var/www/git/More/clientside-request/src/index.js";
var clientside_require = require("clientside-require");
var assert = require('assert');

describe('GET', function(){
    it("should be able to send a GET reqeust and retreive data", async function(){
        var request = await clientside_require.asynchronous_require(module_path);
        var response = await request("http://localhost:3000/say_hello");
        assert.equal(response, "hello")
    })
    it("should be able to set querystring parameters accurately", async function(){
        var request = await clientside_require.asynchronous_require(module_path);
        var response = await request({uri:"http://localhost:3000/query", data:{test:true}});
        assert.equal(typeof response, "object");
        assert.equal(response.test, 'true'); // note that query string casts all types into strings
    })
    it("should be able to send a GET reqeust and retreive data with cookies:true", async function(){
        // cookies:true results in Coors and Credentials constraints
        var request = await clientside_require.asynchronous_require(module_path);
        var response = await request({uri:"http://localhost:3000/say_hello_cookies-test", cookies:true});
        assert.equal(response, "hello")
    })
})
