const app = require('./app');
// For Vercel serverless, export the app directly
module.exports = app;

// Local development: only listen when not in serverless
if (process.env.VERCEL !== '1') {
  const { PORT } = require('./config');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}