import { Request, Response } from "express";
import { prisma } from "../helpers/dbController.js";
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

export async function login(req: Request, res: Response): Promise<void> {
    try {
        if (!req.user) {
            res.redirect("/login");
            return;
        }
        // const logging_id = req.user!.profile.id;
        // const user = await prisma.google.findUnique({
        //     where: {
        //         gid: logging_id
        //     }
        // });
        //console.log("hiii");
        // //console.log(token);
        // //console.log(req.user!.accessToken);

            // createUser(req, res);
            // res.status(300).redirect("/users/create");
            // res.status(404).send("User Doesn't Exists");
            // return;
        res.send(`token: ${req.cookies['X-Auth-Token']}`);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}

export async function logout(req: Request, res: Response): Promise<void> {
    try {
        await prisma.google.update({
            where: {
                gid: req.user!.profile.id as string
            },
            data: {
                access_token: null
            }
        });
        ////console.log('User access token updated successfully.');
    } catch (error) {
        console.error('Error updating user access token:', error);
    }
    res.cookie('X-Auth-Token', '', { maxAge: 1 });
    res.send("Logout Successful");
}



