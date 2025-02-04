const { Router } = require("express");
const { signup, login, getUserInfo, updateProfile, addProfileImage, removeProfileImage, logout,generateName } = require("../controllers/AuthController.js");
const { verifyToken } = require("../middlewares/AuthMiddleware.js");
const { get_signature} = require("../controllers/channelController.js");

const authRoutes = Router();

authRoutes.post('/signup', signup);
authRoutes.post('/login', login);
authRoutes.get('/user-info', verifyToken, getUserInfo);
authRoutes.post('/update-profile', verifyToken, updateProfile);
authRoutes.get('/generate-signature', verifyToken, get_signature); 
authRoutes.post('/add-profile-image', verifyToken, addProfileImage); 
authRoutes.delete('/remove-profile-image', verifyToken, removeProfileImage);
authRoutes.post('/logout', logout);
authRoutes.get('/generate-name', generateName);


module.exports = authRoutes;
