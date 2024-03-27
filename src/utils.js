class Utils {
    clientIP(request) {
        try { return req.headers['CF-Connecting-IP'] || request.connection.remoteAddress || request.ip}
        catch { return `Couldn't grab Client IP`}
    };

    logInfo(log) { 
        if (global.logger) { return global.logger.info(log)} else { return console.log(log)};
    };
}

module.exports = Utils;