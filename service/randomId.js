const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';

const randomId = (length) => {
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

module.exports = randomId;
