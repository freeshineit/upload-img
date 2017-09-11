/**
 * Module dependencies.
 */

const logger = require('koa-logger');
const serve = require('koa-static');
const koaBody = require('koa-body');
const Koa = require('koa');
const fs = require('fs');
const app = new Koa();
const path = require('path');

// log requests

app.use(logger());

app.use(koaBody({ multipart: true }));

// custom 404

app.use(async function(ctx, next) {
  await next();
  if (ctx.body || !ctx.idempotent) return;
  ctx.redirect('/404.html');
});

// serve files from ./public

app.use(serve(path.join(__dirname, '/public')));

// handle uploads images

app.use(async function(ctx, next) {
  // ignore non-POSTs
  if ('POST' != ctx.method) return await next();

  const files = ctx.request.body.files.file;
  const homeDir = path.resolve(__dirname + '/public/static/');

  console.log(ctx.request.body)
  console.log(files.length)

  if(files.length > 0){
      for(var item in files) {
        let reader = fs.createReadStream(files[item].path);
        let stream = fs.createWriteStream(path.resolve(homeDir , files[item].name));
        reader.pipe(stream);
        console.log('uploading %s -> %s', files[item].name, stream.path);
      }
  }else{
        let reader = fs.createReadStream(files.path);
        let stream = fs.createWriteStream(path.resolve(homeDir , files.name));
        reader.pipe(stream);
        console.log('uploading %s -> %s', files.name, stream.path);
  }
  ctx.redirect('/');
});

// listen

app.listen(3001);
console.log('listening on port 3001');