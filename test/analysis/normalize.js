var class_path = "file:///var/www/git/More/clientside-request/src/class.js";
var clientside_require = require("clientside-require");
var assert = require('assert');

describe('normalize', function(){
    describe('defaults', function(){
        it('should default method to "GET"', async function(){
            var request = await clientside_require.asynchronous_require(class_path);
            var options = request.prototype.normalize_options();
            assert.equal(options.method, "GET");
        })
        it('should default cookies to `false`', async function(){
            var request = await clientside_require.asynchronous_require(class_path);
            var options = request.prototype.normalize_options();
            assert.equal(options.cookies, false);
        })
        it('should default json to `false`', async function(){
            var request = await clientside_require.asynchronous_require(class_path);
            var options = request.prototype.normalize_options();
            assert.equal(options.json, false);
        })
    })
    describe('casting', function(){
        describe('parameters', function(){
            it('should consider string input as request for GET at uri of string', async function(){
                var request = await clientside_require.asynchronous_require(class_path);
                var options = request.prototype.normalize_options('google.com');
                assert.equal(options.uri, "google.com");
            })
            it('should append header for POST - form', async function(){
                var request = await clientside_require.asynchronous_require(class_path);
                var options = request.prototype.normalize_options({method : "POST"});
                assert.equal(options.headers['content-type'], "application/x-www-form-urlencoded")
            })
            it('should append header for POST - json', async function(){
                var request = await clientside_require.asynchronous_require(class_path);
                var options = request.prototype.normalize_options({method : "POST", json:true});
                assert.equal(options.headers['content-type'], "application/json")
            })
        })
        describe('data', function(){
            it('should cast `data` to `qs` for "GET"', async function(){
                var request = await clientside_require.asynchronous_require(class_path);
                var options = request.prototype.normalize_options({data:"data"});
                assert.equal(options.qs, options.data);
            })
            it('should cast `data` to `body` for "POST.json"', async function(){
                var request = await clientside_require.asynchronous_require(class_path);
                var options = request.prototype.normalize_options({data:"data", method:"POST", json:true});
                assert.equal(options.body, options.data);
            })
            it('should cast `data` to `form` for "POST.form"', async function(){
                var request = await clientside_require.asynchronous_require(class_path);
                var options = request.prototype.normalize_options({data:"data", method:"POST", json:false});
                assert.equal(options.form, options.data);
            })
        })
    })

})
