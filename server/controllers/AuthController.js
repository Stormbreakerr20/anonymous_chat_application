import User from "../models/UserModel.js";
import pkg from 'jsonwebtoken';
const {sign} = pkg;

const maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (email, userId) => {
    try {
        return sign({ email, userId }, process.env.JWT_SECRET, { expiresIn: maxAge });
    } catch (error) {
        console.error("Token creation error:", error);
        throw new Error("Failed to create token");
    }
};

export const signup = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const user = await User.create({ 
            email, 
            password,
            profileSetup: false,
        });

        const token = createToken(user.email, user._id);
        
        res.cookie('jwt', token, {
            maxAge: maxAge,
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        });

        return res.status(201).json({ 
            user: {
                id: user._id,
                email: user.email,
                profileSetup: user.profileSetup,
            }
        });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};

export const login = async (req, res,next) => {
    try {
        const { email, password,} = req.body;
        if(!email || !password) {
            return res.status(400).send("email and password are required");
        }
        const user = await User.findOne({ email });
        if(!user){
            return res.status(404).send("User not found");
        }
        const isMatch = await user.comparePassword(password);
        if(!isMatch){
            return res.status(401).send("Invalid email or password");
        }
        res.cookie('jwt',createToken(user.email,user.id),{
            maxAge:maxAge,
            secure:true,
            sameSite:'None'
        });
        return res.status(200).json({ user:{
            id:user.id,
            email:user.email,
            profileSetup:user.profileSetup,
            firstName:user.firstName,
            lastName:user.lastName,
            image:user.image,
            color:user.color,
        },
     });
    } catch (error) {
        console.log({error});
        return res.status(500).send("Internal server error");
    }

}

export const getUserInfo = async (req, res,next) => {
    try {

        const userData = await User.findById(req.userId);
        if(!userData){
            return res.status(404).send("User not found");
        }
        
        return res.status(200).json({ user:{
            id:userData.id,
            email:userData.email,
            profileSetup:userData.profileSetup,
            firstName:userData.firstName,
            lastName:userData.lastName,
            image:userData.image,
            color:userData.color,
        },
     });
    } catch (error) {
        console.log({error});
        return res.status(500).send("Internal server error");
    }

}
