import { Request, Response } from "express";
import { prisma } from "../helpers/dbController.js";
import jwt from "jsonwebtoken";
// import { createUser } from "../controllers/userController.js";


export async function authverify(req: Request, res: Response, next: Function) {
    const incomimg_token = req.cookies;
    ////console.log(incomimg_token);
    if (!incomimg_token) {
        res.redirect("/login");
        return;
    }
    if (!incomimg_token['X-Auth-Token']) {
        res.redirect("/login");
        return;
    }
    try {
        jwt.verify(incomimg_token['X-Auth-Token'], process.env.SECRET_KEY as string, async (err: any, decodedtoken: any) => {
            if (err) {
                res.redirect("/login");
                return;
            }
            else {
                // //console.log(decodedtoken);
                await prisma.google.findUnique(
                    {
                        where: {
                            access_token: decodedtoken.id
                        }
                    }
                );
                //console.log(user)

                // if (!user) {
                //     res.redirect("/login"); 
                //     //  createUser(req, res);//redirect and need to figure out how tp bring req.user on redirect
                //      return;
                //     }
                next();
            }
        });
        // res.send("user exists")
        return;
    } catch (error) {
        res.send(error)
    }
}

// export async function isAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
//     const incomimg_token = req.cookies;
//     const decodedToken: string = incomimg_token['X-Auth-Token'];
//     //console.log(decodedToken);
//     const u1 = await prisma.google.findUnique({
//         where: {
//             access_token:decodedToken
//         }
//     });
//     const id=u1!.gid as string;
//     const user = await prisma.users.findUnique({
//         where: {
//             gid:id
//         }
//     });

//     if (user?.is_admin) {
//         //console.log(user)
//         next();
//     } else {
//         res.status(401).send("Not Authorised");
//     }
// }