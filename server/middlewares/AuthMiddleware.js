const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const token = req.cookies.jwt;
    if(!token) {
        return res.status(401).send("Unauthorized");
    }
    jwt.verify(token, process.env.JWT_SECRET, async(err, user) => {
        if(err) {
            return res.status(403).send("Forbidden");
        }
        req.userId = user.userId;
        next();
    });
};