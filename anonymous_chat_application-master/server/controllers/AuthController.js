const User = require("../models/UserModel.js");
const {sign} = require('jsonwebtoken');
const {renameSync , unlinkSync} = require("fs");
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

const maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (email, userId) => {
    try {
        return sign({ email, userId }, process.env.JWT_SECRET, { expiresIn: maxAge });
    } catch (error) {
        console.error("Token creation error:", error);
        throw new Error("Failed to create token");
    }
};

exports.signup = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Anonymous Id and password are required" });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Anonymous Id already exists" });
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

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({ message: "Anonymous Id and password are required" });
        }
        const user = await User.findOne({ email });
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = await user.comparePassword(password);
        if(!isMatch) {
            return res.status(401).json({ message: "Invalid Anonymous Id or password" });
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

exports.getUserInfo = async (req, res,next) => {
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

exports.updateProfile = async (req, res,next) => {
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

exports.addProfileImage = async (req, res, next) => {
    try {
        const { imageUrl } = req.body; // Cloudinary URL from frontend
        if (!imageUrl) {
            return res.status(400).json({ message: "No image URL provided" });
        }
        console.log("hello")

        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { image: imageUrl },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        // console.log(updatedUser.image)
        // console.log(res.status(200).json({ image: updatedUser.image })); // Check if it's valid
        
        return res.status(200).json({ image: updatedUser.image });
    } catch (error) {
        console.error("Profile image upload error:", error);
        return res.status(500).json({ message: "Failed to process image upload" });
    }
};
const cloudinary = require("cloudinary").v2; // Add Cloudinary

exports.removeProfileImage = async (req, res, next) => {
    try {
        const { userId } = req;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.image) {
            try {
                const publicId = user.image.split('/').pop().split('.')[0]; // Extract public ID from URL
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.error("Error deleting Cloudinary image:", err);
            }
        }

        user.image = null;
        await user.save();

        return res.status(200).json({ message: "Profile image removed successfully" });
    } catch (error) {
        console.log({ error });
        return res.status(500).send("Internal server error");
    }
};

exports.logout = async (req, res, next) => {
    try{
        res.cookie('jwt', '', { maxAge: 1 ,secure: true, sameSite: 'None'});
        res.status(200).send("Logged out successfully");
    }catch(error){
        console.log({error});
        return res.status(500).send("Internal server error");
    }
}

exports.generateName = async (req, res) => {
  try {
    let isUnique = false;
    let randomName;
    
    while (!isUnique) {
      randomName = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        length: 2,
        separator: '',
        style: 'capital'
      });
      
      // Check if name exists
      const existingUser = await User.findOne({ firstName: randomName });
      if (!existingUser) {
        isUnique = true;
      }
    }
    
    res.json({ name: randomName });
  } catch (error) {
    res.status(500).json({ message: "Error generating name" });
  }
};
