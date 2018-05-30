module.exports = {
    sendErrorMessage(err) {
        console.log(err.message);
        return res.status(500).json(err.message);
    },
    sendStatusMessage(res, status, message) {
        console.log(status, message);
        return res.status(status).json(message);
    }
};
