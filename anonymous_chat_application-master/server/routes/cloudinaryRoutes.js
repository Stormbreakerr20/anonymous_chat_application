const { get_signature} = require("../controllers/channelController.js");
const { Router } = require("express");
// const router = express.Router();
cloudinaryRoutes=Router();
// const cloudinary = require('../config/cloudinaryConfig');



cloudinaryRoutes.post('/get-signature', get_signature);
module.exports = cloudinaryRoutes;
