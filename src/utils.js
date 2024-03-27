class Utils {
    clientIP(request) {
        try { return (request.headers['cf-connecting-ip'] || request.headers['x-forwarded-for'] || request.ip)}
        catch { return `Couldn't grab Client IP`}
    };

    logInfo(log) { 
        if (global.logger) { return global.logger.info(log)} else { return console.log(log)};
    };
}

module.exports = Utils;