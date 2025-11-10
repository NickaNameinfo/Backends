const JWT = require("jsonwebtoken");
const mailer = require("../../../mailer");
const config = require("../../../config");
const bcrypt = require("bcrypt-nodejs");
const speakeasy = require("speakeasy");
const { validateEmail } = require("./../../../functions");
const db = require("../../../models");
const { Op } = require('sequelize'); // Import Sequelize Op for logical operators
const AWS = require("aws-sdk"); // New import
const dotenv = require("dotenv"); // New import
const sharp = require("sharp"); // Import sharp for image processing
const fs = require("fs"); // New import

// Load environment variables from .env file
dotenv.config(); // New line

// Configure Cloudflare R2 (S3-compatible API)
const s3 = new AWS.S3({ // New S3 configuration
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  signatureVersion: "v4",
  region: "auto",
});

function JWTSign(user, date) {
  const now = new Date();
  return JWT.sign(
    {
      iss: config.app.name,
      sub: user.id,
      iam: user.type,
      iat: date.getTime(),
      exp: Number(new Date(now.getTime() + 24 * 60 * 60 * 1000)),
    },
    config.app.secret
  );
}

function generateOtp() {
  let token = speakeasy.totp({
    secret: process.env.OTP_KEY,
    encoding: "base32",
    step: 30 - Math.floor((new Date().getTime() / 1000.0) % 30),
  });
  return token;
}

function verifyOtp(token) {
  let expiry = speakeasy.totp.verify({
    secret: process.env.OTP_KEY,
    encoding: "base32",
    token: token,
    step: 30 - Math.floor((new Date().getTime() / 1000.0) % 30),
    window: 0,
  });
  return expiry;
}

module.exports = {
  async addUser(req, res, next) {
    const {
      firstName,
      lastName,
      phoneNo,
      email,
      address,
      password,
      role,
      verify,
    } = req.body;
    var passwordHash = bcrypt.hashSync(password);
    var token = generateOtp();
    var otp = verifyOtp(token);
    db.user
      .findOne({ where: { email: email }, paranoid: false })
      .then((find) => {
        if (find) {
          throw new RequestError("Email is already in use", 409);
        }
        return db.user.create({
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phoneNo,
          address: address,
          password: passwordHash,
          verify: verify,
          role: role,
        });
      })
      .then((user) => {
        // if (user) {
        //     mailer.sendEmployeePassword(email, token);
        //     return res.status(200).json({ success: true, key: otp, msg: "New Registration added and password has been sent to " + email + " ." });
        // }
        // else
        res.status(200).json({ success: true, user });
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  },

  async findUser(req, res, next) {
    db.user
      .findOne({
        where: { id: req.params.id },
        paranoid: false,
      })
      .then((user) => {
        if (user) {
          return res.status(200).json({ success: true, data: user });
        } else res.status(500).json({ success: false });
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  },

  async getAllUserList(req, res, next) {
    try {
      const users = await db.user.findAll({
        where: {
          role: 3, // Filter users with role === 3
        },
      });

      if (users && users.length > 0) {
        return res.status(200).json({ success: true, data: users });
      } else {
        return res.status(404).json({ success: false, message: "No users found with role 3" });
      }
    } catch (err) {
      console.error(err);
      next(err);
    }
  },

  async userUpdate(req, res, next) {
    const {
      id,
      firstName,
      lastName,
      email,
      address,
      password,
      role,
      verify,
      vendorId,
      storeId,
    } = req.body;
    var passwordHash = bcrypt.hashSync(password);
    db.user
      .findOne({ where: { email: email }, paranoid: false })
      .then((user) => {
        if (!user) {
          throw new RequestError("User is not found", 409);
        }
        return db.user.update(
          {
            firstName: firstName ? firstName : user.firstName,
            lastName: lastName ? lastName : user.lastName,
            password: password ? passwordHash : user.passwordHash,
            address: address ? address : user.address,
            role: role ? role : user.role,
            verify: verify ? verify : user.verify,
            vendorId: vendorId ? vendorId : user.vendorId,
            storeId: storeId ? storeId : user.storeId,
          },
          {
            where: {
              [Op.or]: [
                { id: id ? id : null }, // Check if the `id` matches
                { email: email ? email : null }, // Or if the `email` matches
              ],
            },
          }
        );
      })
      .then((user) => {
        if (user) {
          return res.status(200).json({
            success: true,
            msg: "User update successsfully",
          });
        } else res.status(500).json({ success: false });
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  },

  async login(req, res, next) {
    try {
      // Check if user data exists
      if (!req.user) {
        return res.status(400).json({
          success: false,
          message: "User data is missing.",
        });
      }

      // Generate token
      const currentDate = new Date();
      const token = JWTSign(req.user, currentDate);

      if (!token) {
        return res.status(500).json({
          success: false,
          message: "Failed to generate token.",
        });
      }

      // Set the cookie
      res.cookie("XSRF-token", token, {
        expires: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000), // Cookie expiration set to 30 days
        httpOnly: true, // Secure the cookie
        secure: config.app.secure, // Use HTTPS if the app is in secure mode
      });

      // Send the response
      return res.status(200).json({
        success: true,
        token,
        role: req.user.role,
        id: req.user.id,
        data: req.user,
      });
    } catch (error) {
      // Catch any unexpected error and return a proper response
      console.error("Login error:", error);
      return res.status(500).json({
        success: false,
        message: "An error occurred during login.",
      });
    }
  },

  async deleteUserList(req, res, next) {
    db.user
      .findOne({ where: { id: req.body.id } })
      .then((data) => {
        if (data) {
          return db.user
            .destroy({ where: { id: req.body.id } })
            .then((r) => [r, data]);
        }
        throw new RequestError("User is not found", 409);
      })
      .then((re) => {
        return res
          .status(200)
          .json({ status: "deleted userlist Seccessfully" });
      })
      .catch((err) => {
        next(err);
      });
  },

  /**
   * Controller to handle file uploads to Cloudflare R2.
   * This function expects a file to be present in `req.file` (handled by multer middleware).
   */
  async uploadFileController(req, res) { // New controller function
    try {
      // Check if a file was actually uploaded by multer
      if (!req.file) {
        return res.status(400).send({
          success: false,
          message: "No file uploaded. Please ensure the 'photo' field is present in the form data.",
        });
      }

      const file = req.file; // req.file directly contains the file object
      const fileName = file.originalname; // Use originalname for the R2 Key
      let fileContent = file.buffer; // Use the buffer directly for file content
      const fileMimeType = file.mimetype; // Use the mimetype

      // If the file is an image, compress it
      if (fileMimeType.startsWith("image/")) {
        try {
          fileContent = await sharp(fileContent)
            .resize({ width: 800 }) // Resize image to a max width of 800px
            .jpeg({ quality: 80 }) // Compress JPEG images to 80% quality
            .png({ quality: 80 }) // Compress PNG images to 80% quality
            .toBuffer();
        } catch (sharpError) {
          console.error("Image compression error:", sharpError);
          return res.status(500).send({
            success: false,
            message: "Error compressing image.",
            error: sharpError.message,
          });
        }
      }

      // Parameters for S3 upload
      const params = {
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME, // Your R2 bucket name
        Key: fileName, // The name the file will have in R2
        Body: fileContent, // The file content from buffer
        ContentType: fileMimeType, // The MIME type of the file
      };

      let message = "File uploaded successfully!"; // Default message for new upload

      try {
          // Check if the file already exists in the bucket
          await s3.headObject({
              Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
              Key: fileName,
          }).promise();
          // If headObject succeeds, the file exists, so it will be an update
          message = "File updated successfully!";
      } catch (headErr) {
          // If the error is 'NotFound', it means the file doesn't exist,
          // so we proceed with the default 'uploaded successfully' message.
          // For any other error, re-throw it.
          if (headErr.code !== 'NotFound') {
              throw headErr;
          }
      }

      // Upload the file to R2
      const data = await s3.upload(params).promise();

      // No need to remove temporary files as memoryStorage is used

      // Send success response with the URL of the uploaded file
      res.status(200).send({
        success: true,
        message: message, // Use the dynamic message
        fileUrl: `https://pub-5622c42961cc4ef29b17f85c86ab7834.r2.dev/${fileName}`, // The public URL of the uploaded file on R2
      });
    } catch (error) {
      console.error("File Upload Error: ", error);
      res.status(500).send({
        success: false,
        message: "Error uploading file.",
        error: error.message, // Provide the error message for debugging
      });
    }
  },
};
