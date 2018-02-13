# clientside-request

[![npm](https://img.shields.io/npm/v/clientside-request.svg?style=flat-square)](https://www.npmjs.com/package/clientside-request)
[![npm](https://img.shields.io/npm/dm/clientside-request.svg)](https://www.npmjs.com/package/clientside-request)

This is a npm nodule for the front end ([a cmm module](https://github.com/uladkasach/clientside-module-manager)) built to bring the simplicity of [`request-promise`](https://github.com/request/request-promise) package to the browser.


## Installation
`npm install clientside-request --save`


## Example Usage
```js
require("clientside-request")
    .then((request)=>{
        return request("http://same_origin/route") // note, request must be same origin as browsers block cross origin requests.
    })
    .then((response)=>{
        /* */
    })
```
