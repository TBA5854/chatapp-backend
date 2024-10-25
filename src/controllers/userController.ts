import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Create a new user
export const createUser = async (req: Request, res: Response) => {
    //console.log("fired");
    //console.log(req.body);
    const username = req.body["username"];
    if (!username) {
        res.status(400).json({ error: 'Please provide a username' });
        return;
    }
    const Token = req.cookies['X-Auth-Token'];
    try {
        jwt.verify(Token, process.env.SECRET_KEY as string, async (err: any, decodedtoken: any) => {
            if (err) {
                // console.log(err);
                res.redirect("/login");
                return;
            }
            //console.log(decodedtoken);
            const u = await prisma.google.findUnique({
                where: {
                    access_token: decodedtoken.id
                }
            })
            if (!u) {
                res.redirect("/login");
                return;
            }
            const checkUser = await prisma.users.findUnique({
                where: { id: u.gid },
            });
            if (checkUser) {
                res.status(400).json({ error: 'User already exists' });
            }
            const user = await prisma.users.create({
                data: {
                    username,
                    id: u.gid,
                },
            });
            res.status(201).json(user);
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
};

export const getUsers = async (_req: Request, res: Response) => {
    try {
        const users = await prisma.users.findMany();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await prisma.users.findUnique({
            where: { id },
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
        jwt.verify(req.cookies['X-Auth-Token'], process.env.SECRET_KEY as string, async (err: any, decodedtoken: any) => {
            if (err) {
                res.redirect("/login");
                return;
            }
            else {
                const givenUser = await prisma.users.findUnique({
                    where: { username },
                });
                if (!givenUser) {
                    res.status(404).json({ error: 'User not found' });
                    return;
                }
                // //console.log(decodedtoken);
                const user = await prisma.google.findUnique(
                    {
                        where: {
                            access_token: decodedtoken
                        }
                    }
                );
                if (!user) {
                    res.redirect("/login");
                    //  createUser(req, res);//redirect and need to figure out how tp bring req.user on redirect
                    return;
                }
                if (givenUser.username !== user.gid) {
                    await prisma.users.delete({
                        where: { username },
                    });
                    res.status(204).send();
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
};