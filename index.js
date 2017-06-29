// var Imap = require('imap');
const util = require('util');
const inspect = util.inspect;
var fs = require('fs'), fileStream;
var exit = require('exit');
var imaps = require('imap-simple');
var counter = 0;
var emails = { };
var config = require('./config.js').config;

imaps.connect(config).then(function (connection) {
    
    return connection.openBox('INBOX').then(function () {
         console.log('Start')
        // Fetch emails from the last 24h 
        var delay = 1 * 3600 * 1000;
        var yesterday = new Date();
        yesterday.setTime(Date.now() - delay);
        yesterday = yesterday.toISOString();
        var searchCriteria = [
            'ALL'
        ];
 
        var fetchOptions = {
            bodies: ['HEADER', 'TEXT'],
            markSeen: false
        };
 
        return connection.search(searchCriteria, fetchOptions).then(function (results) {
            var body = results.map(function (res) {
                return res.parts.filter(function (part) {
                    if(part.which != 'HEADER')
                        counter++;
                    return part.which != 'HEADER';
                })[0].body;
            });
            console.log('Total: %d', counter)
            body.map((b, i)=>{
                b = b.split(/(\r\n)/g).filter(i => i != "\r\n"); 
                emails[i] = {
                    name: b[1],
                    email: b[2],
                    tel: b[3]
                }
            })
            fs.writeFile('body.json', JSON.stringify(emails), () => {
                 connection.end();
                exit(0)
            } )
           
            
            //console.log(subjects);
            // => 
            //   [ 'Hey Chad, long time no see!', 
            //     'Your amazon.com monthly statement', 
            //     'Hacker Newsletter Issue #445' ]
        })
    }).catch(err=>console.trace(err.stack));
});

