import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                username: true,
                email: true,
                profile_photo: true,
                company_name: true,
                bio: true
            }
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found, authentication failed' });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is invalid or expired' });
    }
};

export default auth;
