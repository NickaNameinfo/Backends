const JWT = require("jsonwebtoken");
const mailer = require("../../../mailer");
const config = require("../../../config");
const bcrypt = require("bcrypt-nodejs");
const speakeasy = require("speakeasy");
const { validateEmail } = require("./../../../functions");
const db = require("../../../models");
const { Op } = require('sequelize'); // Import Sequelize Op for logical operators

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
};
