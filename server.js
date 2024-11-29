const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./Routes/AuthRoutes");
const busRoutes = require("./Routes/BusRoutes");
const trainRoutes = require("./Routes/TrainRoutes");
const flightRoutes = require("./Routes/FlightRoutes");
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));
app.use("/api/auth", authRoutes);
app.use("/api/bus", busRoutes);
app.use("/api/train", trainRoutes);
app.use("/api/flight", flightRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
