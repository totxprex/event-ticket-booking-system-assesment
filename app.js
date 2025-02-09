const express = require("express");
const eventRoutes = require("./routes/events");
const db = require("./db/index");
const morgan = require("morgan");

const app = express();

app.use(express.json());

app.use("/", eventRoutes);

app.use(morgan("combined"));

app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
