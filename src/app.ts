import express, { Request, NextFunction, Response } from "express";
import feedRouter from "./routes/feed";
import bodyParser from "body-parser"

const app = express();

app.use(bodyParser.json())

app.use((req: Request,resp: Response, next: NextFunction)=>{
    resp.setHeader('Access-Control-Allow-Origin','*');
    resp.setHeader('Access-Control-Allow-Methods','GET, POST, PUT, PATCH, DELETE');
    resp.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');
    next();
})

app.use('/feed', feedRouter)

app.listen(4040)