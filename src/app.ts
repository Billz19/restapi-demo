import express, { Request, NextFunction, Response } from "express";
import feedRouter from "./routes/feed";
import authRouter from "./routes/auth";
import bodyParser from "body-parser"
import { connect } from 'mongoose'
import { join } from "path";
import multer from "multer";
import {socket} from "./socket"

const app = express();

const fileStorage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, callback: (err: Error | null, dest: string) => void) => {
        callback(null, 'dist/images');
    },
    filename: (req: Request, file: Express.Multer.File, callback: (err: Error | null, dest: string) => void) => {
        callback(null, new Date().toISOString() + '-' + file.originalname)
    }
});

const fileFilter = (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
    const regex = /^image\/(png|jpg|jpeg)$/
    if (regex.test(file.mimetype)) {
        callback(null, true);
    } else {
        callback(null, false);
    }
}
app.use(bodyParser.json())

app.use(multer({
    storage: fileStorage,
    fileFilter
}).single('image'));

app.use('/dist/images', express.static(join(__dirname,'images')));

app.use((req: Request, resp: Response, next: NextFunction) => {
    resp.setHeader('Access-Control-Allow-Origin', '*');
    resp.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    resp.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})

app.use('/feed', feedRouter)

app.use('/auth', authRouter)

app.use((error: Error, req: Request, resp: Response, next: NextFunction) => {
    console.log(error);
    const { message, statusCode, data } = error as any;
    resp.status(statusCode || 500).json({ message , data})
})
connect('mongodb://localhost:27017/messages', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected');
   const server = app.listen(4040);
   const io = socket.init(server);
   io.on('connection',(socket:any)=>{
    console.log('Client connected')
   })
}).catch(error => console.log(error))
