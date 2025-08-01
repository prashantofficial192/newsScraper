import mongoose from "mongoose";

async function connectToDatabase() {
    try {
        // const db = await mongoose.connect(process.env.MONGO_URI);
        // console.log("Connected to MongoDB:", db.connection.name);
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'StockScraper',
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process with failure
    }
}

export default connectToDatabase;