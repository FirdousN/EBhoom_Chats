const express = require('express');
const router = express.Router();
const userController = require("../controllers/auth.controller")
const authenticateToken = require("../middlewares/jwtAuth")
const protectRoute = require ("../middlewares/auth.middleware")

// const { memoryStorage } = require('multer');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;


const { CloudinaryStorage } = require('multer-storage-cloudinary');


/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

//GET checkAuth 

// router.get("/check", protectRoute, checkAuth);
router.get("/check", userController.checkAuth);

//POST signup
router.post("/signup",authenticateToken.authenticateToken,userController.signup);

//login
router.post('/login',userController.login)

// logOut
router.post("/logout",userController.logout)

// updateProfile
router.put('/update-profile',authenticateToken.authenticateToken,userController.protectRoute,userController.updateProfile)


//profileUpdation
// router.get('/',authenticateToken.authenticateToken,userController.getProfile)

//edit user profile
router.put('/edit_my_profile/:id',authenticateToken.authenticateToken,userController.editProfile)


//add profile pic
console.log("Cloudinary Config:", cloudinary.config());
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'profile_pics',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

// multer upload pic
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});


router.post('/add_profile_photo/:id', upload.single('profilePic'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    console.log("File received:", req.file);

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'profile_pics',
    });

    console.log("Cloudinary Upload Success:", result);

    res.json({ success: true, message: "Profile photo uploaded successfully", data: result });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
});

// router.post('/add_profile_photo/:id',upload.single('profilePic'),userController.addProfilePic)

module.exports = router;