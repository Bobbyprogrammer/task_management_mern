export default function errorHandler(error, _req, res, _next) {
  console.error(error);
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ message: "Invalid request data." });
  }
  res.status(500).json({ message: "Something went wrong. Please try again." });
}
