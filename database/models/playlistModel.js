const mongoose = require('mongoose');

const dbSchema = new mongoose.Schema({
  title: String,
  img:String,
  is_deleted: {
    type: String,
    required: true,
    default: "n",
    enum: ["n", "y"],
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
  },
  display_in_home: {
    type: Boolean,
    default : false
  },
  display_in_home_playlist: {
    type: Boolean,
    default : false
  },
  mood: String,
  category: String,
  songs:Array
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

module.exports = mongoose.model('playlist', dbSchema);