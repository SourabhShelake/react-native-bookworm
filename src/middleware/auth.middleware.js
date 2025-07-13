import jwt from 'jsonwebtoken';
import User from '../models/User.js';


const protectRoute = async (req, res, next) => {

    try {
        // get token from the header
        const token = req.header(autharization).replace("berer", "");
        if (!token) {
            return res.status(401).json({ message: "No authentication token, access denied" });
        }
        // verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // find user
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Token is not valid"});
        }

        req.user = user;
        next();

    } catch (error) {
        console.error("Authentication erroe:", error.message);
        res.status(401).json({ message: "Token is not valid" });
    }
};

export default protectRoute;