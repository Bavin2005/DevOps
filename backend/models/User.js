const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["Employee", "IT", "Admin"],
      default: "Employee"
    },
    department: {
      type: String
    },
    leaveBalance: {
      annual: { type: Number, default: 20 },
      sick: { type: Number, default: 10 },
      personal: { type: Number, default: 5 }
    },
    birthDate: { type: Date },
    joiningDate: { type: Date }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
