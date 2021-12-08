const mongoose = require('mongoose');

const clientSchema = mongoose.Schema(
  {
    clientName: { type: String, required: true, unique: true },
    contacts: [{ email: String, name: String }],
  },
  { timestamps: true }
);

const client = mongoose.model('client', clientSchema);

module.exports = client;
