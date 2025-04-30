const models = require('../models');

const { Domo } = models;

const makerPage = async (req, res) => res.render('app');

const makeDomo = async (req, res) => {
  if (!req.body.name || !req.body.age || !req.body.level) {
    return res.status(400).json({ error: 'Name, age, and level are all required!' });
  }

  const domoData = {
    name: req.body.name,
    age: req.body.age,
    level: req.body.level,

    owner: req.session.account._id,
  };

  try {
    // Prevents a Domo from being created with an existing name, and increases its level by 1
    const existingDomo = await Domo.findOne({
      name: req.body.name,
      owner: req.session.account._id,
    }).exec();
    if (existingDomo) {
      existingDomo.level += 1;
      await existingDomo.save();
      return res.status(400).json({ error: 'Domo already exists!' });
    }

    const newDomo = new Domo(domoData);
    await newDomo.save();
    return res.status(201).json({ name: newDomo.name, age: newDomo.age, level: newDomo.level });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occured making domo!' });
  }
};

const getDomos = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const docs = await Domo.find(query).select('name age level').lean().exec();

    return res.json({ domos: docs });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving domos!' });
  }
};

const deleteDomo = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Domo ID is required!' });
    }

    const deletedDomo = await Domo.findByIdAndDelete(id);

    if (!deletedDomo) {
      return res.status(404).json({ error: 'Domo not found!' });
    }

    return res.status(200).json({ message: 'Domo deleted successfully!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'An error occurred while deleting the Domo.' });
  }
};

module.exports = {
  makerPage,
  makeDomo,
  getDomos,
  deleteDomo,
};
