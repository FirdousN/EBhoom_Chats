const userHelper = require("../helpers/userHelper")
const User = require("../model/userModel")
const  generateToken = require  ("../middlewares/jwtAuth");
const bcrypt = require ('bcryptjs')
const cloudinary  = require ('../lib/cloudinary')


module.exports = {
    signup:async(req,res)=>{
      try {
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

    login:async(req,res)=>{
      console.log('user login auth.controller');
  
        try {
            console.log("⭐this is login form data..req.body⭐",req.body,);
            const response = await userHelper.forLogin(req.body);
            console.log(response,"❤️this is response....");
            if (response.login && response.userExist) {
                const userData=response.userExist
                const userId = response.userExist._id;
                const username = response.userExist.username;

                // Generate Token
                const Token = await userHelper.createToken(userId.toString(), username);
                console.log("⭐Token in auth.controller login::",Token);

                // Send token with cookie or response
                res.cookie("jwt", Token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });

                res.json({message:"user successfully loggedIn",status:true, userData, Token});
            } else {
                res.json({status:false,message:"user not registered!"})
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({message:"internal server error!!"})
        }
    },

    logout: async (req,res) => {
      try {
        res.cookie("jwt", "" , {maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully"})
      } catch (error) {
        
      }
    },

    getProfile: async (req, res) => {
        try {
          console.log(req.params.id, "⭐iiiiiiiiiiiiiiiiiiiddd");
          const Getuser = await userHelper.getOneUser(req.params.id);
          console.log(Getuser, "enter into conroller");
          if (Getuser.error || Getuser.notfind) {
            res.json({ message: "User not found" });
          } else {
            res.status(200).json({ Getuser });
          }
        } catch (error) {
          console.log(error);
          res.status(500).json({ message: "internal server error" });
        }
      },

    updateProfile: async (req,res) => {
        try {
          console.log('⭐UpdateProfile:',req.body);
          
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
    
    protectRoute: async (req,res) => {
      try {
        
      } catch (error) {
        
      }
    }
    ,
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

     addProfilePic : async (req, res) => {
        try {
            console.log(req.file,"hiiiiiiiiiiiiiiii")
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
    
      checkAuth : (req, res) => {
        try {
          console.log('⭐ req.user:',req.user);
          
          res.status(200).json(req.user);
        } catch (error) {
          console.log("Error in checkAuth controller", error.message);
          res.status(500).json({ message: "Internal Server Error" });
        }
      }
}

 