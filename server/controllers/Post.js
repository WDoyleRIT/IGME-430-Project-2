const models = require('../models');

//const { Domo } = models;
const { Post } = models;

const makerPage = async (req, res) => res.render('app');

const makePost = async (req, res) => {
  const isPremium = req.session.account.isPremium;

  if(req.body.title && !isPremium){
    return res.status(400).json({ error: 'Premium required to add title to post!' });
  }

  if (!req.body.content) {
    return res.status(400).json({ error: 'Cannot create a post with no content!' });
  }

  const postData = {
    title: req.body.title || 'No Title',
    content: req.body.content,

    owner: req.session.account._id,
  };

  try {
    /*const existingDomo = await Domo.findOne({
      name: req.body.name,
      owner: req.session.account._id,
    }).exec();
    if (existingDomo) {
      existingDomo.level += 1;
      await existingDomo.save();
      return res.status(400).json({ error: 'Domo already exists!' });
    }*/

    const newPost = new Post(postData);
    await newPost.save();
    return res.status(201).json({ title: newPost.title, content: newPost.content});
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured making post!' });
  }
};

const getPosts = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Post.find(query).select('title content').lean().exec();

    return res.json({ posts: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving posts!' });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Post ID is required!' });
    }

    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found!' });
    }

    return res.status(200).json({ message: 'Post deleted successfully!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while deleting the Post.' });
  }
};

module.exports = {
  makerPage,
  makePost,
  getPosts,
  deletePost,
};