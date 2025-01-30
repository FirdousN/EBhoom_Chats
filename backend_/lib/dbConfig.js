var mongoose = require("mongoose");
var dotenv = require("dotenv");

dotenv.config(); // Ensure dotenv is configured before usage
// console.log("MongoDB URL:", process.env.MONGODB_ATLAS_URL); // Log the URL to check

const DdbConfig = async () => {
    try {
        const mongoDB_URL = process.env.MONGODB_ATLAS_URL; // Retrieve the MongoDB URL from environment variables
        if (!mongoDB_URL) {
            throw new Error('MONGODB_ATLAS_URL is not defined in environment variables');
        }
        
        await mongoose.connect(mongoDB_URL); // Use await with mongoose.connect
        console.log('⭐Database Connected');
    } catch (error) {
        console.error('Database connection error:', error.message || error);
        process.exit(1); // Exit the process on failure
    }
};

module.exports = DdbConfig;
