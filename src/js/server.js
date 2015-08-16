var http = require('http');
var url = require('url');
var fs = require('fs');
var index = 'index.html';

http.createServer(function(req, res) {
    
    if (req.url == '/') {
        fs.readFile('./index.html', 'binary', function(err, content) {
            if (err) {
                console.log(err);
            } else {
                res.writeHead(200);
                res.write(content);
                res.end();
            }
        });
    } else if (req.url == '/dist/style.css') {
        fs.readFile('./dist/style.css', function(err, content) {
            if (err) {
                console.log(err);
            } else {
                res.writeHead(200, {"Content-Type": "text/css"});
                res.write(content);
                res.end();
            }
        });
    } else if (req.url == '/dist/bundle.js') {
        fs.readFile('./dist/bundle.js', 'binary', function(err, content) {
            if (err) {
                console.log(err);
            } else {
                res.writeHead(200);
                res.write(content);
                res.end();   
            }
        });
    } else {
        res.statusCode = 404;
        res.end();
    }

}).listen(3000, function(err) {
    if (err) throw err;
    console.log('Listening to the sweet sound of port 3000...');
});
