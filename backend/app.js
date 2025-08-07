import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connect from './db/db.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoute.js';
import cookieParser from 'cookie-parser';
import aiRoutes from './routes/ai.routes.js'; // Import AI routes

dotenv.config();
connect();


const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use('/ai', aiRoutes);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

export default app;