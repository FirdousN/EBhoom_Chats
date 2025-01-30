const User = require("../model/userModel.js");
const Message = require("../model/messageModel.js");
const cloudinary = require("../lib/cloudinary.js");
const { getReceiverSocketId } = require ("../lib/socket.js")

// Export the controller functions
module.exports = {
    getUserForSidebar: async (req, res) => {
        console.log("⭐getUserForSidebar:", req.params);

        try {
            if (!req.user || !req.user.userId) {
                return res.status(401).json({ message: "Unauthorized: No user ID found" });
            }
            const loggedInUserId = req.user.userId;
            // 
            console.log('00000loggedInUserId000000',loggedInUserId);
            
            const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

            res.status(200).json(filteredUsers);
        } catch (error) {
            console.error("Error in getUsersForSidebar: ", error.message);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    getMessages: async (req, res) => {
        console.log('⭐getMessages: req.params', req.params);
        try {

            const { id: userToChatId } = req.params;
            const myId = req.user.userId;
            console.log('⭐myId:', myId);
            console.log('⭐userToChatId:', userToChatId);

            const message = await Message.find({
                $or: [
                    { senderId: myId, receiverId: userToChatId },
                    { senderId: userToChatId, receiverId: myId },
                ]
            })

            res.status(200).json(message)
        } catch (error) {
            console.log("Error in getMessages controller: ", error.messages);
            res.status(500).json({ error: "Internal server error" })
        }
    },

    sendMessage: async (req, res) => {
        console.log("Backend⭐sendMessage:", req.body);
        try {
            const { text, image } = req.body;
            const { id: receiverId } = req.params;
            const senderId = req.user.userId;

            let imageUrl;
            if (image) {
                // Upload base64 image to cloudinary
                const uploadResponse = await cloudinary.uploader.upload(image);
                imageUrl = uploadResponse.secure_url;
            }

            const newMessage = new Message({
                senderId,
                receiverId,
                text,
                image: imageUrl,
            });

            await newMessage.save();
            console.log('⭐Message Save Db success fully');
            
            // realtime functionality goes here => socket.io

            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", newMessage);
            }

            res.status(201).json(newMessage);
        } catch (error) {
            console.log("Error in sendMessage controller: ", error.message);
            res.status(500).json({ error: "Internal server error" });
        }
    },
};