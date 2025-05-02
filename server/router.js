const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getPosts', mid.requiresLogin, controllers.Post.getPosts);

  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.get('/maker', mid.requiresLogin, controllers.Post.makerPage);
  app.post('/maker', mid.requiresLogin, controllers.Post.makePost);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

  app.get('/getAccounts', mid.requiresLogin, controllers.Account.getAccounts);
  app.post('/buyPremium', controllers.Account.buyPremium);

  app.delete('/deletePost', controllers.Post.deletePost);
};

module.exports = router;
