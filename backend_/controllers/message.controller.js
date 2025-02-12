const User = require("../model/userModel.js");
const Message = require("../model/messageModel.js");
const cloudinary = require("../lib/cloudinary.js");
const { getReceiverSocketId, io } = require ("../lib/socket")

// Export the controller functions
module.exports = {

    getUserForSidebar: async (req, res) => {
        // console.log("⭐getUserForSidebar:", req.user);

        try {
            if (!req.user || !req.user._id) {
                return res.status(401).json({ message: "Unauthorized: No user ID found" });
            }
            const loggedInUserId = req.user._id;
            console.log('⭐loggedInUserId', loggedInUserId);

            const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
            // console.log('filteredUsers',filteredUsers);

            res.status(200).json(filteredUsers);
        } catch (error) {
            console.error("Error in getUsersForSidebar: ", error.message);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    getMessages: async (req, res) => {
        console.log('⭐getMessages: req.params', req);
        try {

            const { id: userToChatId } = req.params;
            const myId = req.user._id;
            // console.log('⭐myId:', myId);
            // console.log('⭐userToChatId:', userToChatId);

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
            const senderId = req.user._id;

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

            // realtime functionality goes here => socket.io
            console.log('00----reserverId-----000');
            console.log(receiverId);

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