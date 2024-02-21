// Database info

const secretKey = '1234'; // Set your secret key here This Key is very important, complexity is better than simple key.

module.exports = {
  dbConfig: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'namedata', // Your Database Name
    autoReconnect: true,
  },

  secretKeyMiddleware: (req, res, next) => {
    const { key } = req.query;

    if (key === secretKey) {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  },

};