const express = require("express");
const router = express.Router();

const { Post, validatePost } = require("../models/post.model.js");
const ApiHelper = require("../utils/api.helper");
const authenticate = require("../middlewares/authenticate.middleware.js");

router.get("/", authenticate, async (req, res) => {
    try {
        const { search, is_published, status, user } = req.query;

        const query = {};

        if (search && search.length < 3) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "Search length must be more than 3 characters",
                400
            );
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        if (is_published) {
            query.is_published = is_published;
        }

        if (status) {
            query.status = status;
        }

        if (user && user.length !== 24) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "User query length must be equal to 24 characters long",
                400
            );
        }

        if (user) {
            query.user_id = user;
        }

        let posts = await Post.find(query);
        if (posts.length === 0) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "No posts found",
                404
            );
        }

        ApiHelper.generateApiResponse(
            res,
            req,
            "Posts fetched successfully",
            200,
            {
                count: posts.length,
                rows: posts,
            }
        );
    } catch (error) {
        console.log(error);
        ApiHelper.generateApiResponse(
            res,
            req,
            "Somethimg went wrong while getting all posts.",
            500
        );
    }
});

router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "Post not found",
                404
            );
        }

        ApiHelper.generateApiResponse(res, req, "Post found", 200, post);
    } catch (error) {
        ApiHelper.generateApiResponse(
            res,
            req,
            "Something went wrong, could not find post.",
            500
        );
    }
});

router.post("/", async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "All fields are required.",
                400
            );
        }
        const { error } = validatePost(req.body);

        if (error) {
            return ApiHelper.generateApiResponse(res, req, error.message, 400);
        }

        const existingPost = await Post.findOne({ title: req.body.title });

        if (existingPost) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "The post with smae title already exist.",
                409
            );
        }

        const post = await Post.create(req.body);

        ApiHelper.generateApiResponse(
            res,
            req,
            "Post created successfully",
            201,
            post
        );
    } catch (error) {
        ApiHelper.generateApiResponse(
            res,
            req,
            "Something went wrong, please try again later.",
            500
        );
    }
});

router.put("/:id", async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "Inputs can not be empty.",
                400
            );
        }

        const post = await Post.findById(req.params.id);

        if (!post) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "Post not found",
                404
            );
        }

        const fieldNames = [
            "title",
            "description",
            "is_published",
            "status",
            "user_id",
        ];

        let count = 0;

        for (let key in req.body) {
            for (let i = 0; i < fieldNames.length; i++) {
                if (key === fieldNames[i]) {
                    count++;
                }
            }
        }

        if (count === 0) {
            ApiHelper.generateApiResponse(
                res,
                req,
                "Invalid field name entered",
                400
            );
            return;
        }

        const existingPost = await Post.findOne({
            $and: [{ title: req.body.title }, { _id: { $ne: req.params.id } }],
        });

        if (existingPost) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "The post with same title already exists.",
                409
            );
        }

        if (
            req.body.status &&
            (req.body.status !== "active" || req.body.status !== "inactive")
        ) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "Status must be either active or inactive.",
                400
            );
        }

        if (req.body.status == false) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "Status must be either active or inactive",
                400
            );
        }

        if (
            req.body.is_published &&
            (req.body.is_published !== "active" ||
                req.body.is_published !== "inactive")
        ) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "is_published must be either active or inactive.",
                400
            );
        }

        if (req.body.is_published == false) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "is_published must be either active or inactive",
                400
            );
        }

        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            }
        );

        ApiHelper.generateApiResponse(
            res,
            req,
            "Post updated successfully",
            200,
            updatedPost
        );
    } catch (error) {
        ApiHelper.generateApiResponse(res, req, "Something went wrong.", 500);
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return ApiHelper.generateApiResponse(
                res,
                req,
                "Post not found",
                404
            );
        }

        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        ApiHelper.generateApiResponse(
            res,
            req,
            "Post has been successfully deleted",
            200
        );
    } catch (error) {
        ApiHelper.generateApiResponse(
            res,
            req,
            "Something went wrong, while deleting the post.",
            500
        );
    }
});

module.exports = router;
