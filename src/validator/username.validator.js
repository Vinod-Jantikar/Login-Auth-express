const isValidUsername = (username) => {
    const regex = /^[A-Za-z][A-Za-z0-9_]{7,29}$/;
    return regex.test(username);
};

module.exports = isValidUsername;
