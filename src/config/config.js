import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in the environment variables.");
}

if (!process.env.PORT) {
  console.error("Error: PORT is not defined in the environment variables.");
}

const config = {
  MONGO_URI: process.env.MONGO_URI,
  PORT: process.env.PORT || 5000,
};

export default config;