const http = require('http');
const mongoose = require('mongoose');

const headers = {
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, Content-Length, X-Requested-With',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'PATCH, POST, GET, OPTIONS, DELETE',
  'Content-Type': 'application/json',
};

const DBPath = 'mongodb://localhost:27017/MetaWall';
mongoose
  .connect(DBPath)
  .then((response) => {
    console.log('mongoose link ok !!');
  })
  .catch((error) => {
    console.log('mongoose link error', error);
  });

const schemaOptions = {
  toObject: {
    getters: true,
    virtuals: true,
    versionKey: false,
  },
  toJSON: {
    getters: true,
    virtuals: true,
    versionKey: false,
  },
  runSettersOnQuery: true,
  versionKey: false,
};
const PostRequiredFormat = {
  userName: {
    type: String,
    required: [true, '名稱必填'],
  },
  userPhoto: String,
  discussContent: {
    type: String,
    required: [true, '內容必填'],
  },
  discussPhoto: String,
  createAt: {
    type: Date,
    default: Date.now(),
  },
};
const PostSchema = new mongoose.Schema(PostRequiredFormat, schemaOptions);
const PostModel = mongoose.model('Post', PostSchema); // mongoose 'Post' => mongoDB posts

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
server.listen(3005);
