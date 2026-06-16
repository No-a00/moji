import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const clearDB = async () => {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(process.env.MONGOOSE_DB);
        console.log("Connected. Dropping database...");
        await mongoose.connection.db.dropDatabase();
        console.log("Database successfully cleared.");
        process.exit(0);
    } catch (error) {
        console.error("Error clearing database:", error);
        process.exit(1);
    }
};

clearDB();
