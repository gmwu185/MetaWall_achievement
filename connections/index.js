const mongoose = require('mongoose');
const dotenv = require('dotenv');

require('dotenv').config();

console.log('NODE_ENV', process.env.NODE_ENV);
let DBPath = '';
if (process.env.NODE_ENV === 'production') {
  DBPath = process.env.DB_URL;
  DBPath = DBPath.replace('<password>', process.env.DB_PASSWORD);
  DBPath = DBPath.replace('myFirstDatabase', process.env.DB_NAME);
} else if (process.env.NODE_ENV === 'development') {
  console.log('env development > else if');
  DBPath = 'mongodb://localhost:27017/' + process.env.DB_NAME;
}

mongoose
  .connect(DBPath)
  .then((response) => {
    console.log('mongoose link ok !!');
  })
  .catch((error) => {
    console.log('mongoose link error', error);
  });
