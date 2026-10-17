// Server statis tanpa dependensi. Jalankan: npm start
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const port = Number(process.env.PORT) || 3000;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.md': 'text/plain; charset=utf-8' };
http.createServer((request, response) => {
  let file;
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(`${root}${path.sep}`)) throw new Error('Invalid path');
  } catch {
    response.writeHead(400).end('Permintaan tidak valid');
    return;
  }
  fs.readFile(file, (error, data) => {
    if (error) return response.writeHead(404).end('File tidak ditemukan');
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    response.end(data);
  });
}).listen(port, '127.0.0.1', () => console.log(`RuangKuliah siap: http://localhost:${port}`));
