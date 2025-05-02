const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => res.render('login');

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    req.session.account = Account.toAPI(account);

    return res.json({ redirect: '/maker' });
  });
};

const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);
    return res.json({ redirect: '/maker' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }
    return res.status(500).json({ error: 'An error occured!' });
  }
};

const getAccounts = async (req, res) => {
  try {
    const currentUsername = req.session.account?.username;

    const accounts = await Account.find(
      { username: { $ne: currentUsername } },
      'username'
    );
    const accountNames = accounts.map(account => account.username); 

    return res.json({ accounts: accountNames });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while fetching account names.' });
  }
};

const buyPremium = async (req, res) => {
  try {
    const accountId = req.session.account._id;

    if(req.session.account.isPremium == true){
      return res.json({ message: 'Account is already premium!' });
    }

    await Account.findByIdAndUpdate(accountId, { isPremium: true });

    req.session.account.isPremium = true;

    return res.json({ message: 'Account upgraded to premium!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while upgrading to premium.' });
  }
};

module.exports = {
  loginPage,
  login,
  logout,
  signup,
  getAccounts,
  buyPremium,
};
