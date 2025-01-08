import User from "../models/UserModel.js";
import pkg from 'jsonwebtoken';
const {sign} = pkg;
import {renameSync , unlinkSync} from "fs";
import nodemailer from 'nodemailer';
import UserOTPVerification from "../models/UserOTPVerification.js";
// import pkg from 'bcryptjs';



const maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (email, userId) => {
    try {
        return sign({ email, userId }, process.env.JWT_SECRET, { expiresIn: maxAge });
    } catch (error) {
        console.error("Token creation error:", error);
        throw new Error("Failed to create token");
    }
};




export const checkEmailExist = async (req, res, next) => {
    try {
        const { email} = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: "Email does not exists" });
        }
        else return res.status(200).json({ message: "Email Exists" });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};





export const checkEmail = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email are required" });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        else return res.status(200).json({ message: "Valid Email" });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: error.message || "Internal server error" });
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




export const transporter = nodemailer.createTransport({
    
    service: "gmail",
  port: 465,
  secure: true,
    auth: {
        user:"blundermonkey820@gmail.com",
        pass:"hnli cyls atwg nawo",
    }
});
  
// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Controller
export const sendOTP = async (req, res) => {
    const { email } = req.body;

    console.log("Received request to send OTP for email:", email);

    if (!email) {
        console.log("Error: Email is missing in the request.");
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const otp = generateOTP();
        const now = new Date();
        const otpExpiration = new Date(now.getTime() + 5 * 60 * 1000);

        console.log("Generated OTP:", otp);
        console.log("OTP expiration time:", otpExpiration);

        console.log("Attempting to create OTP record in the database...");
        const otpRecord = await UserOTPVerification.create({
            email,
            otp,
            createdAt: now,
            expiresAt: otpExpiration,
        });

        console.log("OTP record created successfully:", otpRecord);

        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Your OTP Code for Anonymous Chat",
            text: `Your OTP is: ${otp}. It will expire in 5 minutes.`, // Optional plain text
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
                    <div style="max-width: 400px; margin: 20px auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
                        <h2 style="color: #4CAF50; text-align: center; margin-bottom: 20px;">Anonymous Chat OTP</h2>
                        <p>Dear User,</p>
                        <p>Here is your one-time password (OTP) for Anonymous Chat:</p>
                        <div style="text-align: center; margin: 20px auto; font-size: 24px; font-weight: bold; color: #333; border: 1px dashed #4CAF50; border-radius: 4px; padding: 10px; background-color: #fff;">
                            ${otp}
                        </div>
                        <p>This OTP is valid for <strong>5 minutes</strong>.</p>
                        <p>If you didn’t request this, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                        <p style="text-align: center; font-size: 12px; color: #999;">
                            Anonymous Chat Team | Secure & Private Conversations
                        </p>
                    </div>
                </div>
            `,
        };
        
        console.log("Mail options prepared:", mailOptions);

        console.log("Verifying SMTP transporter...");
        transporter.verify((error) => {
            if (error) {
                console.error("SMTP connection error:", error);
                return res.status(500).json({ message: "SMTP connection failed" });
            }
            console.log("SMTP transporter verified successfully.");
        });

        console.log("Attempting to send email...");
        const emailResponse = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", emailResponse);

        return res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Error during OTP sending process:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Verify OTP Controller
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const otpRecord = await UserOTPVerification.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    await UserOTPVerification.deleteOne({ email, otp });

    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const resetPassword = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
    //   const salt = await genSalt(10);
    //   user.password = await hash(password, salt);
      user.password=password;
      await user.save();
  
      return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      return res.status(500).json({ message: error.message || 'Internal server error' });
    }
  };
  


