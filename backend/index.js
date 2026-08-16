import app from "./app.js";
import connectDatabase from "./config/database.js";

const PORT = process.env.PORT || 5000;

connectDatabase()
  .then(() => app.listen(PORT, () => console.log(`TaskFlow API running on http://localhost:${PORT}`)))
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
