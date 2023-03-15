const mongoose = require('mongoose');

const dbSchema = new mongoose.Schema({
  user_id: String,
  song_id:String,
  playlist_id: String
}, {
    timestamps: true,
    toObject: {
      transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  });

module.exports = mongoose.model('playlist_song', dbSchema);