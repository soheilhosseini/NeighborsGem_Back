const data = {};
data.me = require("../model/me.json");

const getMyInfo = (req, res) => {
  res.json(data.me);
};

const createMyInfo = (req, res) => {
  res.json({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
  });
};

const updateMyInfo = (req, res) => {
  res.json({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
  });
};

const deleteMyInfo = (req, res) => {
  res.json({ id: req.body.id });
};

const getUserInfo = (req, res) => {
  res.json({ id: req.params.id });
};

module.exports = {
  getMyInfo,
  createMyInfo,
  updateMyInfo,
  deleteMyInfo,
  getUserInfo,
};
