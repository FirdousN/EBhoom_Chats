const express = require('express');
const router = express.Router();
const { checkAuth, signup, login, logout, updateProfile, editProfile } = require("../controllers/auth.controller")
const {authenticateToken} = require("../middlewares/jwtAuth")
const {protectRoute} = require ("../middlewares/auth.middleware")

// const { memoryStorage } = require('multer');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const { CloudinaryStorage } = require('multer-storage-cloudinary');

// // ✅ Middleware to set headers
// router.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "http://localhost:5174");
//     res.setHeader("Access-Control-Allow-Credentials", "true");
//     res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//     res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//     next(); // ✅ Move to the next middleware
// });

router.get("/", (req, res) => {
    console.log('Ebhoom Chat Api is calling!');
    
    res.send("Ebhoom Chat's Api is calling!");  // Ensure 'send' instead of 'sent'
    // res.json({ message: "EBhoom Chat's Backend is running!" });
});


//GET checkAuth ::
// router.get("/check", protectRoute, checkAuth);
router.get("/check", protectRoute ,checkAuth);

//POST signup ::
router.post("/signup",signup);

//Post login ::
router.post("/login",login)

//Post logOut ::
router.post("/logout",logout);

// updateProfile::
router.put("/update-profile",authenticateToken,protectRoute,updateProfile)

//edit user profile::
router.put("/edit_my_profile/:id",authenticateToken,editProfile)

//profileUpdation 
// router.get('/',authenticateToken,getProfile)

//add profile pic
// console.log("Cloudinary Config:", cloudinary.config());
// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: 'profile_pics',
//     allowed_formats: ['jpg', 'png', 'jpeg'],
//   },
// });

// multer upload pic
// const upload = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
// });

// router.post('/add_profile_photo/:id', upload.single('profilePic'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: "No file uploaded." });
//     }

//     console.log("File received:", req.file);

//     // Upload file to Cloudinary
//     const result = await cloudinary.uploader.upload(req.file.path, {
//       folder: 'profile_pics',
//     });

//     console.log("Cloudinary Upload Success:", result);

//     res.json({ success: true, message: "Profile photo uploaded successfully", data: result });
//   } catch (error) {
//     console.error("Upload Error:", error);
//     res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
//   }
// });

// router.post('/add_profile_photo/:id',upload.single('profilePic'),userController.addProfilePic)

module.exports = router;