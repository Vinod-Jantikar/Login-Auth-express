const { v4: uuidv4 } = require("uuid");

const CommonHelper = {
    generateUniqueId: () => {
        return uuidv4();
    },
};

module.exports = CommonHelper;
