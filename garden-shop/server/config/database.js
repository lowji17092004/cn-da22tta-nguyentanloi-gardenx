const mongoose = require('mongoose');

function connect(uri) {
  return mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
}

module.exports = { connect };
