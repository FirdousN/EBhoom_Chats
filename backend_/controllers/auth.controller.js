const userHelper = require("../helpers/userHelper")
const User = require("../model/userModel")
// const generateToken = require("../middlewares/jwtAuth");
const { generateToken, setTokenInCookie } = require("../lib/utils");
const bcrypt = require('bcryptjs')
const cloudinary = require('../lib/cloudinary')


module.exports = {

  signup: async (req, res) => {
    try {
      // console.log('⭐Signup res::', res.body,'⭐Signup res::');
      const { username, email, password } = req.body
      if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const user = await User.findOne({ email });

      if (user) return res.status(400).json({ message: "Email already exists" });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        username,
        email,
        password: hashedPassword,
      });

      if (newUser) {
        // generate jwt token here
        generateToken(newUser._id, res);
        await newUser.save();

        res.status(201).json({
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          profilePic: newUser.profilePic,
        });
      } else {
        res.status(400).json({ message: "Invalid user data" });
      }
    } catch (error) {
      console.log("Error in signup controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  login: async (req, res) => {
    const { email, password } = req.body;
    console.log('Login res::', res.body);

    try {
      const user = await User.findOne({ email });
      console.log("⭐user::", user);

      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Generate Token
      generateToken(user._id, res);

      res.status(200).json({
        _id: user._id,
        fullName: user.username,
        email: user.email,
        profilePic: user.profilePic,
      });

    } catch (error) {
      console.log("Error in login controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  logout: async (req, res) => {
    try {
      // console.log("userController");

      res.setHeader("Clear-Site-Data", '"cookies", "storage"');
      res.cookie("jwt", "", { httpOnly: true, secure: true, sameSite: "strict", maxAge: 0 });
      res.status(200).json({ message: "Logged out successfully" })
    } catch (error) {
      console.log("Error in logout controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getProfile: async (req, res) => {
    try {
      // console.log( "⭐getProfile || id::",req.params.id );
      const getUser = await userHelper.getOneUser(req.params.id);
      // console.log(getUser, "enter into controller");
      if (getUser.error || getUser.notFind) {
        res.json({ message: "User not found" });
      } else {
        res.status(200).json({ getUser });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "internal server error" });
    }
  },

  updateProfile: async (req, res) => {
    try {
      console.log('⭐UpdateProfile:', req.body);

      const { profilePic } = req.body;
      const userId = req.user._id;

      if (!profilePic) {
        return res.status(400).json({ message: "Profile pic is required" });
      }
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: uploadResponse.secure_url },
        { new: true }
      );

      res.status(200).json(updatedUser);
    } catch (error) {
      console.log("error in update profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // code not implement Yet;;
  protectRoute: async (req, res) => {
    try {

    } catch (error) {

    }
  },//

  // EditProfile is Pending
  editProfile: async (req, res) => {
    try {
      console.log(req.params.id, "id");
      console.log(req.body, ".......");

      // Check if request body contains data
      if (!req.body) {
        console.log("No data received");
        return res.status(400).json({ message: "No data received" });
      }

      // Call helper function to update user profile
      const updatedUserData = await userHelper.getOneUserAndUpdate(req.params.id, req.body);
      console.log(updatedUserData, "userdata updated");

      // Handle different scenarios based on the response from the helper function
      if (updatedUserData.notFound) {
        return res.status(404).json({ message: "User not found" });
      } else if (updatedUserData.error) {
        return res.status(500).json({ message: "Internal server error" });
      } else if (updatedUserData.noChange) {
        return res.status(200).json({ message: "No changes made to the user profile" });
      } else if (updatedUserData.emailExist) {
        return res.status(409).json({ message: "Email already exists" });
      } else if (updatedUserData.mobileExist) {
        return res.status(409).json({ message: "Mobile number already exists" });
      } else if (updatedUserData.update && updatedUserData.updatedUser) {
        const updatedUser = updatedUserData.updatedUser;
        return res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
      } else {
        return res.status(500).json({ message: "Unknown error occurred" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  //have some doubt in this code Pending to use
  addProfilePic: async (req, res) => {
    try {
      console.log('addProfilePic',req.file,)
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const imageUrl = req.file.path; // Cloudinary URL of the uploaded image

      // Update user's profile with image URL
      await User.findByIdAndUpdate(req.params.id, { profilePic: imageUrl });

      res.status(200).json({ success: true, message: 'Profile photo updated successfully', imageUrl });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // CheckAuth
  checkAuth: (req, res) => {
    try {
      console.log('⭐ req.user:', req.user);
      res.status(200).json(req.user);

    } catch (error) {
      console.log("Error in checkAuth controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

