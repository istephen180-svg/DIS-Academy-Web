const http = require('http');
const fs = require('fs');
const path = require('path');
const PORT = Number(process.env.PORT || 10000);
const HOST = process.env.HOST || '0.0.0.0';
const root = __dirname;
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png'};
function serve(req,res){
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.join(root,p);
  if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, {'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': ext === '.html' || ext === '.js' ? 'no-store' : 'public, max-age=3600'});
  fs.createReadStream(file).pipe(res);
}
http.createServer(serve).listen(PORT,HOST,()=>console.log(`DIS Academy frontend running on ${HOST}:${PORT}`));
