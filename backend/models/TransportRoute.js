const mongoose = require("mongoose");

const transportRouteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    pickupPoints: [{ type: String }],
    timings: [
      {
        dayOfWeek: { type: Number, required: true }, // 0=Sun, 1=Mon, ..., 6=Sat
        times: [{ type: String }], // e.g. ["08:00", "18:00"]
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TransportRoute", transportRouteSchema);
