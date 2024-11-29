const mongoose = require("mongoose");
const seatCategorySchema = new mongoose.Schema({
  name: String,
  price: Number,
  rows: [Number],
});
const layoutSchema = new mongoose.Schema({
  rows: Number,
  seatsPerRow: Number,
  seatConfiguration: [[String]],
});
const flightSchema = new mongoose.Schema({
  source: { type: String, required: true },
  destination: { type: String, required: true },
  stops: [String],
  flightName: { type: String, required: true },
  baseFare: { type: Number, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  noOfSeatsAvailable: { type: Number, required: true },
  layout: layoutSchema,
  seatCategories: [seatCategorySchema],
  bookedSeats: { type: [String], default: [] },
});
module.exports = mongoose.model("Flight", flightSchema, "flight");
