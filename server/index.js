import express from "express";
import dotenv from 'dotenv';
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoutes.js";
import { existsSync, mkdirSync } from 'fs';
import contactRoutes from "./routes/ContactRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Ensure uploads directory exists
if (!existsSync('uploads/profiles')) {
    mkdirSync('uploads/profiles', { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads/profiles', express.static('uploads/profiles'));

app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);


const server = app.listen(port, ()=>{
    console.log(`server running at http://localhost:${port}`)
});

const connectionString = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/ShadowTalk';

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.error('Database connection error:', err));