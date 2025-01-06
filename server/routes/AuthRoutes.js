const express = require('express');
const authRoutes = express.Router();
const { signup, login, getUserInfo } = require("../controllers/AuthController.js");
const { verifyToken } = require("../middlewares/AuthMiddleware.js");


authRoutes.post('/signup', signup);
authRoutes.post('/login', login);
authRoutes.get('/user-info',verifyToken,getUserInfo) 

module.exports = authRoutes;