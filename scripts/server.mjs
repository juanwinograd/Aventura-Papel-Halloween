import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),port=Number(process.env.PORT||4175);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json','.ttf':'font/ttf','.png':'image/png','.jpg':'image/jpeg'};
http.createServer(async(req,res)=>{
  try{const url=new URL(req.url,'http://localhost');const relative=decodeURIComponent(url.pathname);if(relative.split('/').some(segment=>segment.startsWith('.'))){res.writeHead(404);res.end();return;}let file=path.resolve(root,'.'+relative);if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}if((await stat(file)).isDirectory())file=path.join(file,'index.html');const bytes=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(bytes);}
  catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('No se encontró la página.');}
}).listen(port,'127.0.0.1',()=>console.log('Aventura en Papel Halloween: http://localhost:'+port));

