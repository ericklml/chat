const mongoose = require('mongoose');
const {Schema } = mongoose;

const UserSchema = new Schema({
  first_name: String,
  last_name: String,
  user: String,
  email: String,
  password: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
