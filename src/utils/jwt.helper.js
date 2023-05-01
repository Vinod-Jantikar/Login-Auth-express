const JWT = require("jsonwebtoken");

const JWT_SECRET_KEY =
    process.env.JWT_SECRET_KEY || "tyuujnhjgfvbnkajadhadhhdahduiu";
const JWT_TOKEN_EXPIRY = process.env.JWT_TOKEN_EXPIRY || "1d";

const JwtHelper = {
    /**
     * Generate a signed jwt token
     * @param {object} payload Input payload to be sent via jwt token
     * @param {string} secretKey Jwt token secret. Default value set from env variable `JWT_SECRET_KEY`
     * @returns Returns a signed jwt token
     */
    sign: async (payload, secretKey = JWT_SECRET_KEY) => {
        let jwtToken = await JWT.sign(payload, secretKey, {
            expiresIn: JWT_TOKEN_EXPIRY,
        });

        return jwtToken;
    },

    verify: async (payload, secretKey = JWT_SECRET_KEY) => {
        let verifiedToken = await JWT.verify(payload, secretKey)
        return verifiedToken
    }
};

module.exports = JwtHelper;
