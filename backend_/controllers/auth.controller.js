const userHelper = require("../helpers/userHelper")
const cloudinary = require("../lib/cloudinary")
const  generateToken = require  ("../middlewares/jwtAuth");
const bcrypt = require ('bcryptjs')

module.exports = {
    signup:async(req,res)=>{
        try {
            console.log(req.body,"user dataaaa");
            await userHelper.userSignup(req.body).then((data)=>{
                if (data.Exist) {
                    res.json({message:' already registered!!'});
                }else if (data.usercreated) {
                    const UserData=data.usercreated
                    console.log(UserData,'registered');
                    res.json({status:true,message:"User registerd",UserData})
                } else {
                    res.json({status:false,UserData})
                }
            }).catch((error)=>{
                res.json(400).json({message:"something went wrong!!"})
            })
        } catch (error) {
            console.log(error);
            res.status(500).json({message:"internal server error!!"})
        }
    },

    login:async(req,res)=>{
        try {
            console.log("⭐this is login form data..req.body⭐",req.body,);
            const response = await userHelper.forLogin(req.body);
            console.log(response,"❤️this is response....");
            if (response.login && response.userExist) {
                const userData=response.userExist
                const userId = response.userExist._id;
                const username = response.userExist.username;

                const Token = await userHelper.createToken(userId.toString(), username);
                console.log(Token);
                res.json({message:"user successfully loggedIn",status:true,userData,Token});
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

 