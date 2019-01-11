var http = require('http');

http.createServer(function(req, res) {
    res.setHeader("Access-Control-Allow-Origin","*");
    res.writeHead(200, { 'Content-Type': 'application/json' });
    // console.log(req);
    res.end(JSON.stringify({haha: 'ge~'}));
}).listen(8888);

console.log('Server running at http://127.0.0.1:8888/');
