import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import healthRouter from "./routes/health.routes";
import authRouter from "./routes/auth.routes";
import employeeRouter from "./routes/employee.routes";
import attendanceRouter from "./routes/attendance.routes";
import leaveRouter from "./routes/leave.routes";
import salaryRouter from "./routes/salary.routes";
import dashboardRouter from "./routes/dashboard.routes";
import reportRouter from "./routes/report.routes";
import faceRouter from "./routes/face.routes";


const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use("/uploads",express.static(path.join(__dirname, "../uploads")));

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/leave", leaveRouter);
app.use("/api/salary", salaryRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/reports", reportRouter);
app.use("/api/face", faceRouter);


export default app;
