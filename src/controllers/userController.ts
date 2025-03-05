import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const createUser = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        res.status(400).json({ error: 'Please provide username and password' });
        return;
    }

    try {
        const checkUser = await prisma.users.findUnique({
            where: { username },
        });
        
        if (checkUser) {
            res.status(400).json({ error: 'Username already exists' });
            return;
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        const user = await prisma.users.create({
            data: {
                username,
                password: hashedPassword,
            },
        });

        const token = jwt.sign(
            { username: user.username },
            process.env.SECRET_KEY as string,
            { expiresIn: '24h' }
        );

        res.cookie('X-Auth-Token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.status(201).json(token);
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        res.status(400).json({ error: 'Please provide username and password' });
        return;
    }

    try {
        const user = await prisma.users.findUnique({
            where: { username },
        });
        
        if (!user) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }

        const token = jwt.sign(
            { username: user.username },
            process.env.SECRET_KEY as string,
            { expiresIn: 60 * 60 * 24 * 30 * 6 } 
        );

        res.cookie('X-Auth-Token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 
        });

        res.status(200).json(token);
        
    } catch (error) {
        res.status(500).json({ error: 'Failed to login' });
    }
};

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