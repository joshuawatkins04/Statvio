const app = require("./app");
const logger = require("./config/logger");

const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
app.listen(PORT, "0.0.0.0", () => {
  logger.debug("Server is running on port.", { port: PORT });
});
