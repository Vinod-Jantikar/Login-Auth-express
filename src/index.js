const express = require("express");

const {
    authController,
    postController,
    userController,
    testController,
} = require("./controllers");
const AuthMiddleware = require("./middlewares/authenticate.middleware");
const { ApiHelper } = require("./utils");

const app = express();

app.use(express.json());

app.get("/", async (req, res) => {
    return ApiHelper.generateApiResponse(res, req, "App is running.", 200);
});

app.use("/test", testController);
app.use("/api/auth", authController);
app.use("/api/users", AuthMiddleware, userController);
app.use("/api/posts", AuthMiddleware, postController);

module.exports = app;
