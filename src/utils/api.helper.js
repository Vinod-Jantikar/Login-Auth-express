const CommonHelpers = require("./common.helper");
const pJson = require("../../package.json");

const ApiHelper = {
    /**
     * Generate API Response JSON using parameters provided
     *
     * @param {Object} res Response Object
     * @param {Object} req Request Object
     * @param {string} msg Message|Error or Message or Error. (general message, success message or error message. If want to send both message & error, use pipe separated string.). Default is empty string.
     * @param {number} code HTTP Status Code. Default is 400.
     * @param {string[]} data Response Payload. Default is empty array.
     *
     * @returns {string} API Response in JSON format
     */
    generateApiResponse: (res, req, msg = "", code = 400, result = []) => {
        var message = "";
        var error = "";
        var requestToken = null;

        if (msg == "" || msg.split("|").length <= 1) {
            message = msg;
            error = msg;
        } else {
            let messages = msg.split("|");
            message = messages[0];
            error = messages[1];
        }

        if (code == 200 || code == 201) {
            error = "";
        }

        // check `x-request-token` in header
        if (
            requestToken == null &&
            req != null &&
            typeof req.headers["x-request-token"] != "undefined"
        ) {
            res.setHeader("X-Request-Token", req.headers["x-request-token"]);
            requestToken = req.headers["x-request-token"];
        }

        // check `request_token` in body
        if (
            requestToken == null &&
            req != null &&
            typeof req.body.request_token != "undefined"
        ) {
            requestToken = req.body.request_token;
        }

        // check `request_token` in query
        if (
            requestToken == null &&
            req != null &&
            typeof req.query.request_token != "undefined"
        ) {
            requestToken = req.query.request_token;
        }

        res.setHeader("x-request-id", CommonHelpers.generateUniqueId());
        res.setHeader("x-api-version", pJson.version);
        return res.status(code).send({
            requestToken,
            message,
            error,
            result,
        });
    },
};

module.exports = ApiHelper;
