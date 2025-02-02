const { Router } = require("express");
const { verifyToken } = require("../middlewares/AuthMiddleware.js");
const { searchContacts } = require("../controllers/ContactsController.js");


const contactRoutes = Router();

contactRoutes.post("/search",verifyToken,searchContacts);

module.exports = contactRoutes;