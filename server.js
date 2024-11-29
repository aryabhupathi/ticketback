// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const authRoutes = require("./Routes/AuthRoutes");
// const busRoutes = require("./Routes/BusRoutes");
// const trainRoutes = require("./Routes/TrainRoutes");
// const flightRoutes = require("./Routes/FlightRoutes");
// dotenv.config();
// const app = express();
// app.use(cors());
// app.use(express.json());
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log(err));
// app.use('/', (req, res) => {
//   res.send('Welcome to the homepage!');
// });
// app.use("/api/auth", authRoutes);
// app.use("/api/bus", busRoutes);
// app.use("/api/train", trainRoutes);
// app.use("/api/flight", flightRoutes);
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


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

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the homepage!");
});

// Use routes for specific APIs
app.use("/api/auth", authRoutes);
app.use("/api/bus", busRoutes);
app.use("/api/train", trainRoutes);
app.use("/api/flight", flightRoutes);

// Fallback for unmatched routes (404)
app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
