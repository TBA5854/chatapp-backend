import { Request, Response } from "express";
import { prisma } from "../helpers/dbController";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
declare global {
    namespace Express {
        interface User {
            profile: {
                id: string;
            };
            accessToken: string;
            refreshToken: string;
        }
    }
}

export const signin = async (req: Request, res: Response) => {
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

export const login = async (req: Request, res: Response) => {
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

export async function logout(_req: Request, res: Response): Promise<void> {
    res.send("Logout Successful");
}



