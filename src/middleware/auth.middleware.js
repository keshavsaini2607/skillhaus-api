const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ detail: "Authorization header missing" });
    }

    try {
        const [scheme, token] = authHeader.split(" ");
        
        if (scheme.toLowerCase() !== "bearer") {
            return res.status(401).json({ detail: "Invalid authentication scheme" });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.userId = decoded.sub;
        next();
    } catch (error) {
        return res.status(401).json({ detail: "Invalid token" });
    }
};

module.exports = {
    verifyToken
};