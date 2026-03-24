import passport from "passport";
import pool from "../db/pool.js";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

function configurePassport() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          // console.log("GOOGLE PROFILE:", profile);
          // console.log(email);

          let result = await pool.query(
            "SELECT * FROM users WHERE email =$1 AND role= 'admin'",
            [email], // verifies if user exists in database with role admin
          );
          // console.log(result);
          if (result.rows.length === 0) {
            return done(null, false, { message: "Not authorized as admin" });
          }
          return done(null, result.rows[0]);
        } catch (err) {
          return done(err, null);
        }
      },
    ),
  );
}

export { configurePassport };
