
const User = require("../model/userModel.js")
const bcrypt = require('bcrypt')
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const jwt_token = process.env.JWT_SECRET;


module.exports={
    userSignup: async (userDetails) => {
        try {
          const emailExist = await User.findOne({ email: userDetails.email });
          
          if (emailExist ) {
            return { Exist: true };
          }
          const Password = await bcrypt.hash(userDetails.password, 10);
          const user = new User({
            username: userDetails.username,
            email: userDetails.email,
            password: Password,
          });
          const userCreated = await user.save();
          return { existingUser: false, password: true, userCreated };
        } catch (error) {
          console.log(error);
          throw new Error("something went wrong.please try again later");
        }
      },

      forLogin: async (userData) => {
        try {
          console.log("⭐inside helper functionn⭐:",userData, );
          const userExist = await User.findOne({ email: userData.email });
          if (!userExist) {
            return { login: false };
          } else {
            let checkPassword = await bcrypt.compare(
              userData.password,
              userExist.password
            );
            if (checkPassword) {
              return { login: true, userExist };
            } else {
              return { login: false };
            }
          }
        } catch (error) {
          console.log(error);
          throw new Error("Internal Server Error");
        }
      },
      createToken: async (userId, userName) => {
        if (jwt_token) {
          console.log(jwt_token, "this is secretkey...........");
    
          const token = jwt.sign(
            { userId, userName }, // Wrap the payload in an object
            jwt_token,
            { expiresIn: "1h" }
          );
    
          return token;
        } else {
          throw new Error("JWT TOKEN IS NOT DEFINED!! ");
        }
      },


      getOneUser: async (Id) => {
        try {
          console.log(Id, "in helper........");
          const findUser = await User.findOne({ _id: Id });
          console.log(findUser, "findoutttttttt");
          if (findUser) {
            return { notfind: false }, findUser;
          } else {
            return { notfind: true };
          }
        } catch (error) {
          console.log(error);
          return { error: true };
        }
      },



      getOneUserAndUpdate: async (Id, updatedProfileData) => {
        try {
            console.log(Id, updatedProfileData, "in helper........");
            
            // Fetch the current user data
            const currentData = await User.findById(Id);
            if (!currentData) {
                console.log("User not found");
                return { notFound: true };
            }
            
            // Extract current email and mobile
            const userEmail = currentData.email;
            const userName = currentData.username
      
            // Extract updated email and mobile
            const updatedEmail = updatedProfileData.email;
            const updatedName =updatedProfileData.username
            // Check if both email and mobile are different
            if(userEmail == updatedEmail  && userName==updatedName){
              console.log("no changes..")
              return {noChange:true}
            }
      
            if (userEmail !== updatedEmail ) {
      
                // Check if email is different and exists
                if (userEmail !== updatedEmail) {
                    const existingEmail = await User.findOne({ email: updatedEmail });
                    if (existingEmail) {
                        console.log("Existing email, cannot update");
                        return { emailExist: true };
                    }
                }
      
               
      
                // Update the user
                const updatedUser = await User.findByIdAndUpdate(
                    Id,
                    {
                        username: updatedProfileData.username,
                        email: updatedEmail,
                    },
                    { new: true }
                );
                console.log("Data updated:", updatedUser);
                return { update: true, updatedUser };
            } else {
                console.log("Both email and mobile are same, direct update");
                const updatedUser = await User.findByIdAndUpdate(
                  Id,
                  {
                      username: updatedProfileData.username,
                      
                  },
                  { new: true }
              );
                return { update: true,updatedUser };
            }
        } catch (error) {
            console.error(error);
            return { error: true };
        }
      },
}