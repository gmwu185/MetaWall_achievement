const http = require('http');
const mongoose = require('mongoose');

const headers = {
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, Content-Length, X-Requested-With',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
  'Content-Type': 'application/json',
};
const PostModel = [
  {
    userName: '邊綠小杰',
    userPhoto: 'https://unsplash.it/500/500/?random=4',
    discussContent: '外面看起來就超冷…\n\r我決定回被窩繼續睡…>.<',
    discussPhoto:
      'https://images.unsplash.com/photo-1485594050903-8e8ee7b071a8?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=900&h=350&q=80',
  },
];

const requestListener = async (req, res) => {
  let body = '';
  req.on('data', (chunk) => (body += chunk));

  if (req.url === '/posts' && req.method === 'GET') {
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: 'success',
        data: PostModel,
      })
    );
    res.end();
  } else if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(JSON.stringify({ status: 'fail', data: '無此網站路由' }));
    res.end();
  }
};

const server = http.createServer(requestListener);
server.listen(3005);
