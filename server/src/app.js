import cors from "cors";
import express from "express";
import passport from "passport";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import { configurePassport } from "./config/passport.js";
import flatRoutes from "./routes/flats.routes.js";
import residentRoutes from "./routes/resident.routes.js";
import subscriptionRoutes from "./routes/subscriptions.routes.js";
import subscriptionPlansRoutes from "./routes/subscriptionPlans.routes.js";

const PORT = process.env.PORT || 8000;

const app = express();

configurePassport();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", reportsRoutes);

app.use("/api/flats", flatRoutes);

app.use("/api/resident", residentRoutes);

app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/subscription-plans", subscriptionPlansRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
