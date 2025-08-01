import mongoose from 'mongoose';

export const newsSchema = new mongoose.Schema({
    headline: String,
    link: { type: String, unique: true },
    overview: String,
    source: String,
    tag: String,
    publishedTime: String,
    content: String,
}, {
    timestamps: true,
});