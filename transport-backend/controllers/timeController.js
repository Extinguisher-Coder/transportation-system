// controllers/timeController.js

exports.getServerTime = (req, res) => {
  const serverDate = new Date();
  res.status(200).json({ serverDate });
};
