require("dotenv").config();
const app = require("./index");
const connect = require("./config/db.config");

const PORT = process.env.PORT || 8989;

app.listen(PORT, async () => {
    try {
        await connect();
        console.log("Listening on port 8989");
    } catch (error) {
        console.log(error);
    }
});
