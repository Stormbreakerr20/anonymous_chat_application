import { Router } from "express";
import { signup, login, getUserInfo, updateProfile, addProfileImage, removeProfileImage, logout } from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer";
import { existsSync, mkdirSync } from 'fs';

const authRoutes = Router();

// Ensure uploads directory exists
const uploadDir = 'uploads/profiles';
if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profiles')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        cb(null, `${uniqueSuffix}.${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

authRoutes.post('/signup', signup);
authRoutes.post('/login', login);
authRoutes.get('/user-info',verifyToken,getUserInfo);
authRoutes.post('/update-profile',verifyToken,updateProfile);
authRoutes.post('/add-profile-image',verifyToken,upload.single('profile-image'),addProfileImage);
authRoutes.delete('/remove-profile-image',verifyToken,removeProfileImage);
authRoutes.post('/logout', logout);


export default authRoutes;