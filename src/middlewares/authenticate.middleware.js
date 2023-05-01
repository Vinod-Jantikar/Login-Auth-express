const { ApiHelper, JwtHelper } = require("../utils");
const { User } = require("../models/user.model");

const verifyToken = async (token) => {
    try {
        const decoded = await JwtHelper.verify(token);
        const existingUser = await User.findOne({ _id: decoded.user_id });
        if (existingUser.token !== token) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "User not found",
                400
            );
        }
        return decoded;
    } catch (error) {
        return ApiHelper.generateApiResponse(res, req, "Invalid token", 500);
    }
};

const authenticate = async (req, res, next) => {
    try {
        const bearerToken = req.headers.authorization;
        if (!bearerToken || !bearerToken.startsWith("Bearer ")) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "Please provide a valid authorization token",
                401
            );
        }

        const token = bearerToken.split(" ")[1];
        const user = await verifyToken(token);
        req.user = user;
        next();
    } catch (error) {
        return ApiHelper.generateApiResponse(
            res,
            req,
            "The token is not valid",
            401
        );
    }
};

module.exports = authenticate;
