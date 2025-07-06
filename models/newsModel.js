import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
    source: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true,
        unique: true // ensures no duplicates based on link
    },
    description: {
        type: String
    },
    fetchedAt: {
        type: Date,
        default: Date.now
    },
    publishedAt: {
        type: Date
    }
});

// Optional: helpful indexes for performance
newsSchema.index({ fetchedAt: -1 });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ source: 1 });

const News = mongoose.model('News', newsSchema);

export default News;