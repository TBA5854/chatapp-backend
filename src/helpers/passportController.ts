import googleStrat from "passport-google-oauth20";
import passport from "passport";
import { prisma } from "./dbController.js";

export default setupPassportGoogleAuth;

async function setupPassportGoogleAuth() {
  passport.use(new googleStrat.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
  }, async (accessToken, refreshToken, profile, done) => {
    ////console.log({accessToken, refreshToken, profile});
    try {
      const user = await prisma.google.findUnique({
        where: {
          gid: profile.id
        }
      });
      if (!user) {
        await prisma.google.create({
          data: {
            gid: profile.id,
            access_token: accessToken,
          }
        });
      }
      else {
        await prisma.google.update({
          where: {
            gid: profile.id
          },
          data: {
            access_token: accessToken
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
    // //console.log({profile, accessToken, refreshToken});
    return done(null, { profile, accessToken, refreshToken });
  }));
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user: any, done) {
    done(null, user as false | Express.User | null | undefined);
  });
}
