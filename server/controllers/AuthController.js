import User from "../models/UserModel.js";
import pkg from 'jsonwebtoken';
const {sign} = pkg;
import {renameSync , unlinkSync} from "fs";

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
        if (!email || !password ) {
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

export const login = async (req, res, next) => {
    try {
        const { email, password,fromGoogle } = req.body;
        if(fromGoogle){
            const user = await User.findOne({ email });
            if(!user) {
                return res.status(404).json({ message: "User not found" });
            }
            const token = createToken(user.email, user._id);
        
        res.cookie('jwt', token, {
            maxAge: maxAge,
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        });

        return res.status(200).json({ 
            user: {
                id: user._id,
                email: user.email,
                profileSetup: user.profileSetup,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                color: user.color,
            }
        });
        }

        if(!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
    
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = await user.comparePassword(password);
        if(!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = createToken(user.email, user._id);
        
        res.cookie('jwt', token, {
            maxAge: maxAge,
            httpOnly: true,
            secure: true,
            sameSite: 'None'
        });

        return res.status(200).json({ 
            user: {
                id: user._id,
                email: user.email,
                profileSetup: user.profileSetup,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                color: user.color,
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getUserInfo = async (req, res,next) => {
    try {

        const userData = await User.findById(req.userId);
        if(!userData){
            return res.status(404).send("User not found");
        }
        
        return res.status(200).json({ 
            id:userData.id,
            email:userData.email,
            profileSetup:userData.profileSetup,
            firstName:userData.firstName,
            lastName:userData.lastName,
            image:userData.image,
            color:userData.color,
        
     });
    } catch (error) {
        console.log({error});
        return res.status(500).send("Internal server error");
    }

}

export const updateProfile = async (req, res,next) => {
    try {

        const {userId} = req;
        const {firstName, lastName, color} = req.body;
        if(!firstName || !lastName || color ===null){
            return res.status(400).send("firstname, lastname and color are required");
        }
        
        const userData = await User.findByIdAndUpdate(userId, {firstName, lastName, color,profileSetup:true}, {new:true, runValidators:true});

        return res.status(200).json({ 
            id:userData.id,
            email:userData.email,
            profileSetup:userData.profileSetup,
            firstName:userData.firstName,
            lastName:userData.lastName,
            image:userData.image,
            color:userData.color,
        
     });
    } catch (error) {
        console.log({error});
        return res.status(500).send("Internal server error");
    }

}

export const addProfileImage = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Profile image is required" });
        }

        // Log for debugging
        console.log("Received file:", req.file);

        // Use the file path as provided by multer
        const filePath = req.file.path.replace(/\\/g, '/'); // Convert Windows path to URL format

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { image: filePath },
            { new: true }
        );

        if (!updatedUser) {
            // Cleanup file if user update fails
            try {
                unlinkSync(req.file.path);
            } catch (err) {
                console.error('File cleanup error:', err);
            }
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            image: filePath
        });
    } catch (error) {
        console.error('Profile image upload error:', error);
        // Cleanup file on error
        if (req.file?.path) {
            try {
                unlinkSync(req.file.path);
            } catch (err) {
                console.error('File cleanup error:', err);
            }
        }
        return res.status(500).json({ message: "Failed to process image upload" });
    }
};

export const removeProfileImage = async (req, res, next) => {
    try {
        const {userId} = req;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }


        if (user.image) {
            try {
                unlinkSync(user.image);
            } catch (err) {
                console.log("Error deleting file:", err);
            }
        }

        user.image = null;
        await user.save();

        return res.status(200).json({ message: "Profile image removed successfully" });
    } catch (error) {
        console.log({error});
        return res.status(500).send("Internal server error");
    }
}

export const logout = async (req, res, next) => {
    try{
        res.cookie('jwt', '', { maxAge: 1 ,secure: true, sameSite: 'None'});
        res.status(200).send("Logged out successfully");
    }catch(error){
        console.log({error});
        return res.status(500).send("Internal server error");
    }
}

