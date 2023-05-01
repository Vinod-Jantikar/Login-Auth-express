const mongoose = require("mongoose");
const Joi = require("joi");

const {schemaValidator} = require("../validator")

const postSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        is_published: { type: String, enum: ["active", "inactive"], required: true },
        status: { type: String, enum: ["active", "inactive"], required: true },
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

const joiPostSchema = Joi.object({
    title: Joi.string().min(5).max(50).required().messages({
        "string.empty": "Title can not be empty",
        "string.min": "Title length must be atleast 5 characters long.",
        "string.max": "Title length must not exceed 50 characters long.",
    }),
    description: Joi.string().min(10).required().messages({
        "string.empty": "description can not be empty",
        "string.min": "description length must be atleast 10 characters long.",
    }),
    is_published: Joi.string().valid("active", "inactive").required().messages({
        "any.only":
            "is_published must be one of [active, inactive] and can not be empty",
    }),
    status: Joi.string().valid("active", "inactive").required().messages({
        "any.only":
            "status must be one of [active, inactive] and can not be empty",
    }),
    user_id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
});

const validatePost = schemaValidator(joiPostSchema);

const Post = mongoose.model("post", postSchema);

module.exports = { Post, validatePost };
