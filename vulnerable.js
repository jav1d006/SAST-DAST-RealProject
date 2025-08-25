// src/vulnerable.js
const http = require('http');
const url = require('url');
const fs = require('fs');

http.createServer((req, res) => {
    const query = url.parse(req.url, true).query;
    if (query.cmd) {
        // XƏBƏRDARLIQ: eval təhlükəli
        const result = eval(query.cmd);
        fs.writeFileSync('output.txt', result); // insecure file write
        res.end(`Result: ${result}`);
    } else {
        res.end('Send ?cmd=<code>');
    }
}).listen(8080, () => console.log('Server running'));
