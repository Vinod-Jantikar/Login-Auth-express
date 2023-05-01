const express = require("express");

const router = express.Router();
const { User, validateUser } = require("../models/user.model");
const authenticate = require("../middlewares/authenticate.middleware.js");
const { usernameValidator } = require("../validator");
const { ApiHelper, JwtHelper } = require("../utils");

router.post("/register", async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "All fields required.",
                400
            );
        }

        const { error } = validateUser(req.body);

        if (error) {
            return ApiHelper.generateApiResponse(res, req, error.message, 400);
        }

        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "User with same email already exist",
                409
            );
        }

        const existingUsername = await User.findOne({
            username: req.body.username,
        });

        if (existingUsername) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "User with same username already exist",
                409
            );
        }

        if (!usernameValidator(req.body.username)) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "The username should starts with an alphabet, and should contain only alphabets, numbers or underscores.",
                400
            );
        }

        let user = await User.create(req.body);

        user = await User.findOne(
            { email: req.body.email },
            { password: 0, token: 0 }
        );

        ApiHelper.generateApiResponse(
            res,
            req,
            "User registered successfully",
            201,
            user
        );
    } catch (error) {
        ApiHelper.generateApiResponse(
            res,
            req,
            "Something went wrong while registering.",
            500
        );
    }
});

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })
            .select("password")
            .select("status");

        if (!user) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "Invalid credentials, either email or password are wrong.",
                401
            );
        }

        const match = user.checkPassword(req.body.password);

        if (!match) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "Invalid credentials, either email or password are wrong.",
                401
            );
        }

        if (user.status === "inactive") {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "Inactive user; User disabled",
                401
            );
        }

        let payload = { user_id: user._id };
        const token = await JwtHelper.sign(payload);

        await User.findByIdAndUpdate(user._id, { token });

        ApiHelper.generateApiResponse(
            res,
            req,
            "User logged in successfully.",
            200,
            { token }
        );
    } catch (error) {
        ApiHelper.generateApiResponse(
            res,
            req,
            "Something went wrong, please try again",
            500
        );
    }
});

router.post("/logout", authenticate, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user.user_id, {
            $unset: { token: "" },
        });
        ApiHelper.generateApiResponse(res, req, "Logged out successfully", 200);
    } catch (error) {
        ApiHelper.generateApiResponse(res, req, "Something went wrong", 500);
    }
});

module.exports = router;
