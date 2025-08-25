// vulnerable.js
// Məqsədli zəiflik nümunəsi (Snyk Code üçün)

// HTTP request + user input
const http = require('http');
const url = require('url');

http.createServer((req, res) => {
    const queryObject = url.parse(req.url, true).query;
    if(queryObject.cmd) {
        // XƏBƏRDARLIQ: eval təhlükəli → SAST tapacaq
        const output = eval(queryObject.cmd);
        res.end(`Result: ${output}`);
    } else {
        res.end('Send a query parameter "cmd"');
    }
}).listen(8080, () => console.log('Server running on port 8080'));
