const app = require("./app");

const PORT = process.env.PORT || 5000;

// app.listen(PORT, "0.0.0.0", () => {
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});