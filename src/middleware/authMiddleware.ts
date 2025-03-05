import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


export async function authverify(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const incomimg_token = authHeader && authHeader.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : null;    ////console.log(incomimg_token);
    if (!incomimg_token) {
        res.status(401).json({"error":"No Bearer Token"})
        // res.redirect("/login");
        return;
    }
    try {
        jwt.verify(incomimg_token, process.env.SECRET_KEY as string, async (err: any, _decodedtoken: any) => {
            if (err) {
                res.status(401).json({"error":"Invalid or expired token"});
                return;
            }
            else {
                // //console.log(decodedtoken);
                
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