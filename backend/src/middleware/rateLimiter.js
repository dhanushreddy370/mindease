import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
    const ip = req.socket.remoteAddress;
    try {
        const { success } = await ratelimit.limit(ip);
        if (!success) {
            return res.status(429).json({ message: "Too many requests" });
        }
        next();
    } catch (error) {
        console.error("Rate limit error (Allowing traffic):", error.message);
        next(); // Fail Open: Allow request even if Rate Limiter fails
    }
}

export default rateLimiter
