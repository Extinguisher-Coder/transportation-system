const Setting = require('../models/settingModel');

// ✅ GET a setting by key
exports.getSetting = async (req, res) => {
  const { key } = req.params;

  try {
    const setting = await Setting.findOne({ key });
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.status(200).json({ value: setting.value }); // ✅ Return value wrapped in an object
  } catch (err) {
    console.error('Error fetching setting:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ✅ PUT (update or create) a setting by key
exports.updateSetting = async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (!value) {
    return res.status(400).json({ error: 'Value is required' });
  }

  try {
    const setting = await Setting.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
    res.status(200).json(setting); // optional: you can return { value: setting.value } if you prefer
  } catch (err) {
    console.error('Error updating setting:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
