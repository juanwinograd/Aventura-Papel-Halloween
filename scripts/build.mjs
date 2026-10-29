import {mkdir,cp,copyFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const dir of ['src','assets'])await cp(dir,'dist/'+dir,{recursive:true});
await copyFile('index.html','dist/index.html');
console.log('Halloween listo en dist/.');
