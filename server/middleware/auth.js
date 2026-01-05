import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
    const token = req.headers.authorization;
    // Token is not available
    if(!token) {
        return res.json({success: false, message: "login or signup to book or list a car"})
    }
    // Token is available
    try {
        const userId = jwt.verify(token, process.env.JWT_SECRET)

        if(!userId) {
            return res.json({success: false, message: "not authorized now"})
        }
        req.user = await User.findById(userId).select('-password')
        next();
    } catch (error) {
        return res.json({success: false, message: "not authorized"})
    }
}

export default protect
