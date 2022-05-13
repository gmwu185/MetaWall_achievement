const swaggerAutogen = require('swagger-autogen')();

const doc = { // 生成資料、格式、設定
  info: {
    title: 'Meta API',
    description: '示範範例生成文件',
  },
  host: 'localhost:3000',
  schemes: ['http', 'https'],
  securityDefinitions: {
    apiKeyAuth: {
      type: 'apiKey',
      in: 'headers',
      name: 'authorization',
      description: '請加上 API Token'
    }
  },
  definitions: {
    createdPosts: {
      "$name": "createdPost--test 加入 swagger.js 中",
      "content": "createdPost-test",
      "tags": ["string-1", "string-2"],
      "type": "string"
    }
  }
};
const outputFile = './swagger-output.json'; // 使用套件生成文件讀取用的 JSON 資料檔
const endpointsFiles = ['./app.js']; // 專案系統的注入點，成為套件所讀取的檔案

swaggerAutogen(outputFile, endpointsFiles, doc);
