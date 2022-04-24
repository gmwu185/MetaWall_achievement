const http = require('http');
const mongoose = require('mongoose');
require('dotenv').config();

const PostModel = require('./models/post');

const headers = {
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, Content-Length, X-Requested-With',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
  'Content-Type': 'application/json',
};

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



const requestListener = async (req, res) => {
  let body = '';
  req.on('data', (chunk) => (body += chunk));

  if (req.url === '/posts' && req.method === 'GET') {
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: 'success',
        data: await PostModel.find(),
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

        await PostModel.create(newPostData);

        res.writeHead(200, headers);
        res.write(
          JSON.stringify({
            status: 'success',
            data: await PostModel.find(),
          })
        );
        res.end();
      } catch (error) {
        console.log('posts error', error);
      }
    });
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
