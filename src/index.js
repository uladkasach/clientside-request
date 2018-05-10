var promise_class = load('./class')

/*
    note, request is passed as an instance of the function class so that `this` is defined in the object
*/
module.exports = async function(options){
    var Request = await promise_class;
    return new Request(options);
};
