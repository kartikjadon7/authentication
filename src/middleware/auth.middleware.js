import jwt from "jsonwebtoken";
export const authentication = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json("Invalid token");
        }
        const decoded = jwt.decode(token, process.env.JWT_SECRET);
        req.user = decoded;

        next();

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Internal server error" })
    }
}

// ["Admin", "user"]
export const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(401).json("forbidden");
    }
    next();
}