module.exports = {
    host: process.env.REDIS_HOST || "nicknameinfotech.com",
    password : process.env.REDIS_PASSWORD || null,
    port  : process.env.REDIS_PORT || 6379,
};
