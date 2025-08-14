import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protectRoute = async (req, res, next) => {
    try {
        // get token from the header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No authentication token, access denied" });
        }

        const token = authHeader.replace("Bearer ", "");

        // verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // find user
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Token is not valid" });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error("Authentication error:", error.message);
        res.status(401).json({ message: "Token is not valid" });
    }
};

export default protectRoute;
