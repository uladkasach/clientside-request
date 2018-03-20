// unhandled promisses add details:
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise. reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

/*
    setup browser env variables for clientside require
*/
var jsdom = require("jsdom");
var xmlhttprequest = require("xmlhttprequest");
global.window = new jsdom.JSDOM(``,{
    url: "http://test-env.clientside-api-request.localhost",
    resources: "usable", // load iframes and other resources
    runScripts : "dangerously", // enable loading of scripts - dangerously is fine since we are running code we wrote.
}).window;
window.XMLHttpRequest = xmlhttprequest.XMLHttpRequest; // append XMLHttpRequest to window

/*
    define clientside_require
*/
var clientside_require = require("clientside-require");
var assert = require('assert');

/*
    define global vars
*/
var module_path = "file:///var/www/git/More/clientside-request/src/index.js";
var class_path = "file:///var/www/git/More/clientside-request/src/class.js";

/*
    test
*/
describe('syntax', function(){
    it("should load class", async function(){
        var Request = await clientside_require.asynchronous_require(class_path);
        assert.equal(typeof Request, "function", "Request should be a function");
    })
    it("should load module", async function(){
        var request = await clientside_require.asynchronous_require(module_path);
        assert.equal(typeof request, "function", "request should be a function");
    })
})
describe('analysis', function(){
    require("./analysis/normalize");
    require("./analysis/validate");
})

describe('requests', function(){
    require('./methods/get');
    require('./methods/post');
})
