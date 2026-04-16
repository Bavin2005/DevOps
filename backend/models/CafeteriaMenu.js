const mongoose = require("mongoose");

const cafeteriaMenuSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, unique: true }, // YYYY-MM-DD only (start of day)
    items: [
      {
        name: { type: String, required: true },
        type: { type: String, enum: ["Veg", "Non-Veg"], default: "Veg" },
        price: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("CafeteriaMenu", cafeteriaMenuSchema);
