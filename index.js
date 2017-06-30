// var Imap = require('imap');
const util = require('util');
const inspect = util.inspect;
var fs = require('fs'), fileStream;
var exit = require('exit');
var imaps = require('imap-simple');
var counter = 0;
var emails = {};
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
            markSeen: false,
            struct: true
        };

        return connection.search(searchCriteria, fetchOptions).then(function (results) {
            let i = 30;
            let stream = fs.createWriteStream('out.html')
            stream.write(`<!DOCTYPE html>
                            <html lang="en">
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                                <title>Document</title>
                            </head>
                            <body>`);
            var attachments = [];
            results.map(function (res) {
                let mail = '';
                var parts = imaps.getParts(res.attributes.struct);

                attachments = attachments.concat(parts.filter(function (part) {
                    return part.disposition && part.disposition.type.toUpperCase() === 'ATTACHMENT';
                }).map(function (part) {
                    // retrieve the attachments only of the messages with attachments
                    return connection.getPartData(res, part)
                        .then(function (partData) {
                            return {
                                filename: part.disposition.params.filename,
                                data: partData
                            };
                        });
                }));
                console.log(attachments)
                res.parts.map(function (part) {
                    if (part.which == 'HEADER') {
                        mail = '<div style="font-size:10px; background: #e1e1e1;">====HEADER===\n';
                        Object.entries(part.body).map(fiels => {
                            mail += fiels[0] + ':' + fiels[1][0] + '/n';
                        })
                        mail += '</div>';
                    }
                    if (part.which == 'TEXT') {
                        mail += '\n====TEXT===\n' + part.body
                    }
                })
                stream.write(mail.toString('utf8'));
            });
            stream.write(`</body></html>`);

            connection.end();
            //console.log('Total: %d', counter)

            // body.map((b, i)=>{
            //     b = b.split(/(\r\n)/g).filter(i => i != "\r\n"); 
            //     emails[i] = {
            //         name: b[1],
            //         email: b[2],
            //         tel: b[3]
            //     }
            // })

            //  console.log('body: %s', body)
            // fs.writeFile('sup.text',mails, () => {
            //      connection.end();
            //     exit(0)
            // } )


            //console.log(subjects);
            // => 
            //   [ 'Hey Chad, long time no see!', 
            //     'Your amazon.com monthly statement', 
            //     'Hacker Newsletter Issue #445' ]
           return Promise.all(attachments);
        }).then((attachments) =>
             console.log(attachments)
        )
    }).catch(err => console.trace(err.stack));
});

