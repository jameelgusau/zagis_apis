
import express, { Request, Response } from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from "helmet";
import router from './routes';
import { config } from "./config/env";
import imageRouter from './routes/image';
import errorHandler from './errorHandle';
import { logger } from "./config/logger";
import { initialize as initializeDB } from "./db";

const app = express();

app.use(helmet({
    crossOriginResourcePolicy: false,
  }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

app.use(
  cors({
    // origin: (origin, callback) => callback(null, true),
    origin: [
      'http://localhost:3000',
      'http://localhost:8080',
      'http://localhost:3000',
      'http://localhost:300',
      'http://localhost:3001',
      'http://127.0.0.1:5500',
      "http://192.168.1.47:3000",
      "http://192.168.1.147:3000",

    ],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE']
  })
);

app.disable('x-powered-by');


// Define routes
app.use("/api", router);
app.use("/img", imageRouter)

app.use(errorHandler);

const startServer = async () => {
  await initializeDB();

  app.listen(config.port, "0.0.0.0", () => {
    logger.info(`Server running on port ${config.port}`);
  });
};
//"C:\Program Files\PostgreSQL\16\bin\createdb.exe" -U postgres -h localhost zagis


//"C:\Program Files\PostgreSQL\18\bin\pg_restore.exe" -U postgres -h localhost -d zagis C:\zagis_backup.dump
//pm2 start dist/index.js --name zagis-backend
startServer();

