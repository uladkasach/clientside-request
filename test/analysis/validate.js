var class_path = "http://test-env.clientside-request.localhost/src/class.js";
var clientside_require = require("clientside-require");
var assert = require('assert');

describe('validate', function(){
    it('should validate for valid options', async function(){
        var request = await clientside_require.asynchronous_require(class_path);
        var options = request.prototype.normalize_options("google.com");
        var [validity, error] = request.prototype.validate_options(options);
        assert.equal(validity, true);
        assert.equal(error, null)
    })
    it('should return error message for non-string uri', async function(){
        var request = await clientside_require.asynchronous_require(class_path);
        var options = request.prototype.normalize_options();
        var [validity, error] = request.prototype.validate_options(options);
        assert.equal(validity, false);
        assert.equal(error.type, "URI");
    })
    it('should return error message for invalid method', async function(){
        var request = await clientside_require.asynchronous_require(class_path);
        var options = request.prototype.normalize_options({uri:"google.com",method:"foobar"});
        var [validity, error] = request.prototype.validate_options(options);
        assert.equal(validity, false);
        assert.equal(error.type, "METHOD");
    })
    it('should return error message for invalid cookies', async function(){
        var request = await clientside_require.asynchronous_require(class_path);
        var options = request.prototype.normalize_options({uri:"google.com",cookies:"foobar"});
        var [validity, error] = request.prototype.validate_options(options);
        assert.equal(validity, false);
        assert.equal(error.type, "COOKIES");
    })
    it('should return error message for invalid json', async function(){
        var request = await clientside_require.asynchronous_require(class_path);
        var options = request.prototype.normalize_options({uri:"google.com",json:"foobar"});
        var [validity, error] = request.prototype.validate_options(options);
        assert.equal(validity, false);
        assert.equal(error.type, "JSON");
    })
    it('should return error message for POST request with data not defined - form', async function(){
        var request = await clientside_require.asynchronous_require(class_path);
        var options = request.prototype.normalize_options({uri:"google.com", method:"POST", json:false});
        var [validity, error] = request.prototype.validate_options(options);
        assert.equal(validity, false);
        assert.equal(error.type, "FORM");
    })
    it('should return error message for POST request with data not defined - json', async function(){
        var request = await clientside_require.asynchronous_require(class_path);
        var options = request.prototype.normalize_options({uri:"google.com", method:"POST", json:true});
        var [validity, error] = request.prototype.validate_options(options);
        assert.equal(validity, false);
        assert.equal(error.type, "BODY");
    })
})
