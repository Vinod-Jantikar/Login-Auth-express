const mongoose = require("mongoose");
const Joi = require("joi");
const bcrypt = require("bcrypt");

const { schemaValidator } = require("../validator");

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true, minLength: 10 },
    username: { type: String, required: true },
    user_type: { type: String, enum: ["admin", "user"], required: true },
    password: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], required: true },
    token: { type: String },
});

const joiUserSchema = Joi.object({
    first_name: Joi.string().required().messages({
        "string.empty": "first_name can not be empty",
    }),
    last_name: Joi.string().required().messages({
        "string.empty": "last_name can not be empty",
    }),
    email: Joi.string().email().required().messages({
        "string.empty": "email can not be empty",
    }),
    mobile: Joi.string().length(10).required().messages({
        "string.empty": "mobile can not be empty",
    }),
    username: Joi.string().required().messages({
        "string.empty": "username can not be empty",
    }),
    user_type: Joi.string().valid("admin", "user").required().messages({
        "any.only":
            "user_type must be one of [admin, user] and can not be empty",
    }),
    password: Joi.string().required().messages({
        "string.empty": "password can not be empty",
    }),
    status: Joi.string().valid("active", "inactive").required().messages({
        "any.only":
            "status must be one of [active, inactive] and can not be empty",
    }),
    token: Joi.string()
});

userSchema.pre("save", function (next) {
    if (!this.isModified("password")) return next();
    this.password = bcrypt.hashSync(this.password, 10);
    return next();
});

userSchema.methods.checkPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model("user", userSchema);

const validateUser = schemaValidator(joiUserSchema);

module.exports = { User, validateUser };
