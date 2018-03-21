var module_path = "file:///var/www/git/More/clientside-request/src/index.js";
var clientside_require = require("clientside-require");
var assert = require('assert');

describe('POST', function(){
    it("should be able to send a POST without json accurately", async function(){
        var request = await clientside_require.asynchronous_require(module_path);
        var response = await request({uri:"http://localhost:3000/post/form", method:"POST", data:{test:true}});
        assert.equal(typeof response, "object");
        assert.equal(response.test, "true", "test value should be true as string");
    })
    it("should be able to send a POST with json accurately", async function(){
        var request = await clientside_require.asynchronous_require(module_path);
        var response = await request({uri:"http://localhost:3000/post/json", method :"POST", json:true, data : {test:true}});
        assert.equal(typeof response, "object");
        assert.equal(response.test, true, "test value should be true");
    })
    it("should be able to send a GET reqeust and retreive data with cookies:true", async function(){
        // cookies:true results in Coors and Credentials constraints
        var request = await clientside_require.asynchronous_require(module_path);
        var response = await request({uri:"http://localhost:3000/post/json_cookies-test", method :"POST", json:true, data : {test:true}, cookies:true});
        assert.equal(typeof response, "object");
        assert.equal(response.test, true, "test value should be true");
    })
})
