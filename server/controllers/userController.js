import User from "../models/User.js";
import bycrpt from "bcrypt";
import jwt from "jsonwebtoken"
import Car from "../models/Car.js";

const generateToken = (userId) => {
    const payload = userId;
    return jwt.sign(payload, process.env.JWT_SECRET)
}

// Register User
export const registerUser = async (req, res) => {
    try {
        const {name, email, password} = req.body

        // To check if any of these details is missing of password isn't up to 8characters
        if(!name || !email || !password || password.length < 8) {
            return res.json({success: false, message: 'Fill all the fields'})
        }

        // To check if user already exixts
        const userExists = await User.findOne({email})
        if(userExists) {
            return res.json({success: false, message: 'User already exists'})
        }

        const hashedPassword = await bycrpt.hash(password, 10)
        const user = await User.create({name, email, password: hashedPassword})
        const token = generateToken(user._id.toString())
        res.json({success: true, token})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
} 

// User Login
export const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})

        // If cannot found user
        if(!user) {
            return res.json({success: false, message: 'User not found'})
        }

        // If user is available, match the password
        const isMatch = await bycrpt.compare(password, user.password)
        if(!isMatch) {
            return res.json({success: false, message: 'Invalid Credentials'})
        }
        // if password and email match, allow user login and send token
        const token = generateToken(user._id.toString())
        res.json({success: true, token})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Get User data using Token (JWT)
export const getUserData = async (req, res) => {
    try {
        const {user} = req;
        res.json({success: true, user})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Get all cars for the Frontend
export const getCars = async (req, res) => {
    try {
        const cars = await Car.find({isAvailable: true})
        res.json({success: true, cars})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}
