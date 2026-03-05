const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

exports.authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No Token || Unauthorized' });
    }
    try {
        const token = authHeader.split(' ')[1]; // remove Bearer from the token
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decode.id).select('-password'); // remove password from the user in schema
        if (!user) {
            return res.status(401).json({ message: 'User Not Found ' });
        }
        req.user = user;
        next();

    } catch (err) {
        res.status(403).json({ message: 'Token Expired || Forbidden' });
    }

};


