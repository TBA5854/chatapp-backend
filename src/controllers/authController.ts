import { Request, Response } from "express";
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
        // //console.log(token);// 
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

export async function logout(_req: Request, res: Response): Promise<void> {
    res.send("Logout Successful");
}



