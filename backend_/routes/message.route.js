const express = require("express");
const { getUserForSidebar, getMessages, sendMessage} = require("../controllers/message.controller.js"); 
const { protectRoute } = require("../middlewares/auth.middleware.js")
// const {authenticateToken} = require("../middlewares/jwtAuth")


const router = express.Router();

// Define the routes with proper callback functions

 // Get users for sidebar
router.get("/users",protectRoute, getUserForSidebar);   

// Get messages for a user
router.get("/:id",protectRoute, getMessages); 

 // Send a message
router.post("/send/:id",protectRoute,sendMessage);       

module.exports = router;

