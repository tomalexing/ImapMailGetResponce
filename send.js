var key = require('./config.js').key;
var inspect = require('util').inspect;
var GetResponse  = require('getresponse-nodejs-api');
var fs = require('fs');
var api = new GetResponse(key);
api.ping(function(r){console.log(r);});
var i = 0;
fs.readFile('./body.json', 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var dataJson = JSON.parse(data);
  dataJson = dataJson
  Object.values(dataJson).map((email,it) => {
    
    setTimeout((function(email){
      return function(){
        api.addContact('njX3Y', email.name, email.email, null, 0, {'ref':email.tel},function(r){console.log(r);});
      }
    })(email),10*it)
  })
});





