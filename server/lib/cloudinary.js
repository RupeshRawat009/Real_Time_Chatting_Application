// This file configures the Cloudinary SDK using environment variables.
// It is a common pattern for managing API keys and secrets securely.

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  // Your Cloudinary cloud name, API key, and API secret are loaded
  // from environment variables for security.
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// The configured cloudinary object is exported for use in other modules.
export default cloudinary;
