import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../helpers/dbController';






export const getUsers = async (_req: Request, res: Response) => {
    try {
        const users = await prisma.users.findMany({
            select: {
                username: true,
            }
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const getUserByUsername = async (req: Request, res: Response) => {
    const { username } = req.params;
    try {
        const user = await prisma.users.findUnique({
            where: { username },
        });
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { username } = req.params;
    try {
        const token = req.cookies['X-Auth-Token'];
        
        if (!token) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        jwt.verify(token, process.env.SECRET_KEY as string, async (err: any, decoded: any) => {
            if (err) {
                res.status(401).json({ error: 'Invalid token' });
                return;
            }
            
            const targetUser = await prisma.users.findUnique({
                where: { username },
            });
            
            if (!targetUser) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            
            if (decoded.username === username) {
                await prisma.users.delete({
                    where: { username },
                });
                res.status(204).send();
            } else {
                res.status(403).json({ error: 'Not authorized to delete this user' });
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};