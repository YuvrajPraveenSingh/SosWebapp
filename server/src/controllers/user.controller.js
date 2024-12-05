import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const users = await User.findById(userId);
    const accessToken = users.generateAccessToken();
    const refreshToken = users.generateRefreshToken();

    users.refreshToken = refreshToken;
    await users.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};
const register = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    contactNumber,
    emergencyEmail1 = "",
    emergencyEmail2 = "",
    emergencyEmail3 = "",
    emergencyEmail4 = "",
    emergencyEmail5 = "",
  } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !password || !contactNumber) {
    throw new ApiError(400, "All required fields must be filled");
  }

  // Validate contact number
  if (isNaN(contactNumber) || contactNumber <= 0) {
    throw new ApiError(400, "Invalid contact number");
  }


  // Check for existing user
  const existedUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { contactNumber }],
  });

  if (existedUser) {
    if (existedUser.email === email.toLowerCase()) {
      throw new ApiError(409, "User with this email already exists");
    }
    if (existedUser.contactNumber === contactNumber) {
      throw new ApiError(409, "User with this contact number already exists");
    }
  }

  // Create user
  try {
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      contactNumber,
      emergencyEmail1,
      emergencyEmail2,
      emergencyEmail3,
      emergencyEmail4,
      emergencyEmail5,
    });
    // Fetch created user without sensitive info
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering user");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
        },
        "User Logged In Successfully"
      )
    );
  } catch (error) {
    // Handle potential mongoose validation errors
    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors)
        .map((err) => err.message)
        .join(", ");
      throw new ApiError(400, `Validation Error: ${errorMessages}`);
    }
    // Re-throw other errors
    throw error;
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "email is required!!!");
  }

  const user = await User.findOne({
    $or: [{ email }],
  });

  if (!user) {
    throw new ApiError(404, "user doesnot exists!!");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password Incorrect!!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
        },
        "User Logged In Successfully"
      )
    );
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorised request!!!");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token!!!");
    }

    if (incomingRefreshToken !== usre?.refreshToken) {
      throw new ApiError(401, "Refresh token expired!!!");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token refreshed!!!"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token!!!");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await Chapter.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Current Password!!!");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully!!!"));
});

const getSosContacts = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId, {
      emergencyEmail1: 1,
      emergencyEmail2: 1,
      emergencyEmail3: 1,
      emergencyEmail4: 1,
      emergencyEmail5: 1,
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const sosContacts = {
      emergencyEmail1: user.emergencyEmail1,
      emergencyEmail2: user.emergencyEmail2,
      emergencyEmail3: user.emergencyEmail3,
      emergencyEmail4: user.emergencyEmail4,
      emergencyEmail5: user.emergencyEmail5,
    };

    return res
      .status(200)
      .json(
        new ApiResponse(200, sosContacts, "Emergency contact emails retrieved")
      );
  } catch (error) {
    if (error.name === "CastError") {
      throw new ApiError(400, "Invalid user ID");
    }
    throw error;
  }
});

const updateSosContacts = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const {
      emergencyEmail1,
      emergencyEmail2,
      emergencyEmail3,
      emergencyEmail4,
      emergencyEmail5,
    } = req.body;

    const emergencyEmails = [emergencyEmail1, emergencyEmail2, emergencyEmail3, emergencyEmail4, emergencyEmail5];
    emergencyEmails.forEach((emergencyEmail, index) => {
      if (emergencyEmail && !/^\S+@\S+\.\S+$/.test(emergencyEmail)) {
        throw new ApiError(400, `Invalid emergency email ${index + 1}`);
      }
    });

    const user = await User.findByIdAndUpdate(
      userId,
      {
        emergencyEmail1,
        emergencyEmail2,
        emergencyEmail3,
        emergencyEmail4,
        emergencyEmail5,
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          emergencyEmail1: user.emergencyEmail1,
          emergencyEmail2: user.emergencyEmail2,
          emergencyEmail3: user.emergencyEmail3,
          emergencyEmail4: user.emergencyEmail4,
          emergencyEmail5: user.emergencyEmail5,
        },
        "Emergency contact emails updated successfully"
      )
    );
  } catch (error) {
    if (error.name === "CastError") {
      throw new ApiError(400, "Invalid user ID");
    }
    throw error;
  }
});

const userDetails = asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

const sendEmail = asyncHandler(async (req, res) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 465,
        auth: {
          user: 'akashdebn2@gmail.com',  // Your Gmail address
          pass: 'mbspiwhmxjoaacix',     // App Password
        },
      });

      const { to, subject, text } = req.body;
      if (!to || !subject || !text) {
        return res.status(400).json({ error: 'Please provide "to", "subject", and "text" fields' });
      }
    
      // Define email options
      const mailOptions = {
        from: 'akashdebn2@gmail.com',
        to : to,
        subject : subject,
        text : text,
      };

        
        try {
            const info = await transporter.sendMail(mailOptions);
            res.status(200).json({ message: 'Email sent successfully', info });
          } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ error: 'Failed to send email', details: error.message });
          }
    

});

export {
  register,
  login,
  logout,
  refreshAccessToken,
  getSosContacts,
  changePassword,
  updateSosContacts,
  userDetails,
  sendEmail,
};
