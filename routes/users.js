const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const UserSchema = require("../models/UserModel");
const config = require("config");

router.get("/", (req, res) => {
  res.send("Users Route");
});

router.post(
  "/register",
  [
    check("email", "Email is required!").isEmail(),
    check("password", "Password is reqiured!").not().isEmpty(),
  ],
  async (req, res) => {
    try {
      let { email, password } = req.body;
      let user = await UserSchema.findOne({ email: email });
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(401).json({ errors: errors.array() });
      } else {
        if (user) {
          return res
            .status(401)
            .json({ msg: "There's already user with this email!" });
        } else {
          const salt = await bcrypt.genSalt(10);
          password = await bcrypt.hash(password, salt);
          user = new UserSchema({
            email: email,
            password: password,
          });

          await user.save();

          const payload = {
            user: user.id,
          };

          jwt.sign(payload, config.get("jwtSecret"), (err, token) => {
            if (err) throw err;
            res.json({ token: token });
          });
        }
      }
    } catch (error) {
      res.end({ error: error.message });
    }
  }
);

router.post(
  "/login",
  [
    check("email", "Type proper email").isEmail(),
    check("password", "Password is reqiured!").not().isEmpty(),
  ],
  async (req, res) => {
    try {
      let { email, password } = req.body;
      const errors = validationResult(req);
      let user = await UserSchema.findOne({ email: email });

      if (!errors.isEmpty()) {
        return res.status(401).json({ errors: errors.array() });
      }

      if (!user) {
        return res
          .status(401)
          .json({ msg: "There's no user associated with this email!" });
      } else {
        let isPasswordMatch = await bcrypt.compare(password, user.password);
        if (isPasswordMatch) {
          const payload = {
            user: user.id,
          };

          jwt.sign(payload, config.get("jwtSecret"), (err, token) => {
            if (err) throw err;
            res.json({ token: token });
          });
        } else {
          return res.status(401).json({ msg: "Password is incorrect!" });
        }
      }
    } catch (error) {
      res.end({ error: error.message });
    }
  }
);

module.exports = router;
