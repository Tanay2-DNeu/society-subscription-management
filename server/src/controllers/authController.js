import generateToken from "../utils/generateToken.js";

export const googleCallback = (req, res) => {
  const user = req.user;

  const token = generateToken(user.id);

  res.cookie("admin-token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "lax",
    secure: false,
  });

  res.redirect("http://localhost:3000/admin/dashboard");
};

//OAuth authentication is redirect-based. After Google authenticates the user, it redirects to our backend callback. From there we generate a JWT and redirect the user back to the frontend with the token so the SPA can store it and authenticate future requests.

// Controller returns
// {
//  "token": "JWT_TOKEN",
//  "user": {
//    "id": 1,
//    "email": "admin@gmail.com",
//    "role": "admin"
//  }
// }
