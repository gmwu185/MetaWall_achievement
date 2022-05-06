const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const PostModel = require('./models/post');

console.log('NODE_ENV', process.env.NODE_ENV);
let DBPath = '';
if (process.env.NODE_ENV === 'development') {
  DBPath = 'mongodb://localhost:27017/' + process.env.DB_NAME;
} else {
  DBPath = process.env.DB_URL;
  DBPath = DBPath.replace('<password>', process.env.DB_PASSWORD);
  DBPath = DBPath.replace('myFirstDatabase', process.env.DB_NAME);
}

mongoose
  .connect(DBPath)
  .then((response) => {
    console.log('mongoose link ok !!');
  })
  .catch((error) => {
    console.log('mongoose link error', error);
  });

const headers = {
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, Content-Length, X-Requested-With',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
  'Content-Type': 'application/json',
};

const requestListener = async (req, res) => {
  let body = '';
  req.on('data', (chunk) => (body += chunk));

  if (req.url === '/posts' && req.method === 'GET') {
    const rooms = await PostModel.find();
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: 'success',
        data: rooms,
      })
    );
    res.end();
  } else if (req.url === '/posts' && req.method === 'POST') {
    req.on('end', async () => {
      try {
        const { userName, discussContent, userPhoto, discussPhoto } =
          JSON.parse(body);
        const newPostData = {
          userName,
          discussContent,
          userPhoto,
          discussPhoto,
        };
        const createPostData = await PostModel.create({ ...newPostData });
        res.writeHead(200, headers);
        res.write(
          JSON.stringify({
            status: 'success',
            data: createPostData,
          })
        );
        res.end();
        console.log('createPostData', createPostData);
      } catch (error) {
        console.log(
          'POST error.name => ',
          error.name,
          'POST error.message => ',
          error.message
        );
        res.writeHead(400, headers);
        res.write(
          JSON.stringify({
            status: 'false',
            error: error.name == 'SyntaxError' ? '資料格式解析錯誤' : error,
          })
        );
        res.end();
      }
    });
  } else if (req.url == '/posts' && req.method == 'DELETE') {
    await PostModel.deleteMany({});
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: 'success',
        data: [],
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
const localPortNum = 3005;
server.listen(process.env.PORT || localPortNum, () => {
  process.env.PORT
    ? console.log('Deploy Heroku Successfully')
    : console.log(`Server running at http://localhost:${localPortNum}/`);
});
