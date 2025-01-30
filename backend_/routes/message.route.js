const express = require("express");
const { getUserForSidebar, getMessages, sendMessage} = require("../controllers/message.controller.js"); 
const authenticateToken = require("../middlewares/jwtAuth")

const router = express.Router();

// Define the routes with proper callback functions

 // Get users for sidebar
router.get("/users",authenticateToken.authenticateToken,getUserForSidebar);   

// Get messages for a user
router.get("/:id",authenticateToken.authenticateToken, getMessages); 

 // Send a message
router.post("/send/:id",authenticateToken.authenticateToken,sendMessage);       

module.exports = router;

