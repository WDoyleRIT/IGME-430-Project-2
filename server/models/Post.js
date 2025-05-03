const mongoose = require('mongoose');

// const setName = (name) => _.escape(name).trim();

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    // set: setName,
  },
  content: {
    type: String,
    required: true,
    trim: true,
    // set: setName,
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

PostSchema.statics.toAPI = (doc) => ({
  title: doc.title,
  content: doc.content,
});

const PostModel = mongoose.model('Post', PostSchema);
module.exports = PostModel;
