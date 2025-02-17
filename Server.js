// server.js (Backend)
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(express.json());
app.use(cors());

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Define Schema & Model
const ImageSchema = new mongoose.Schema({ url: String });
const Image = mongoose.model("Image", ImageSchema);

// Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "mern_uploads",
    format: async () => "png",
    public_id: (req, file) => file.originalname,
  },
});
const upload = multer({ storage });

// Routes
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const newImage = new Image({ url: req.file.path });
    await newImage.save();
    res.json({ message: "Image uploaded successfully", url: req.file.path });
  } catch (error) {
    res.status(500).json({ message: "Error uploading image", error });
  }
});

app.get("/images", async (req, res) => {
  const images = await Image.find();
  res.json(images);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
