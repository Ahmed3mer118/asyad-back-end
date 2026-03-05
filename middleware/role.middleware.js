exports.authorize = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = String(req.user?.role || "").toLowerCase();
        const normalizedAllowed = allowedRoles.map(r => String(r).toLowerCase());
        if (!normalizedAllowed.includes(userRole)) {
            return res.status(403).json({ message: "Access denied: not allowed role" });
        }
        next();
    };
};