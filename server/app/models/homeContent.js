const mongoose = require("mongoose");

// One document (key "home") holding the editable homepage content. Sections
// missing here fall back to the client's defaults (client/src/constants/home.js).
const HomeContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    content: { type: Object, default: {} },
  },
  { timestamps: true, minimize: false }
);

module.exports = {
  HomeContentModel: mongoose.model("HomeContent", HomeContentSchema),
};
