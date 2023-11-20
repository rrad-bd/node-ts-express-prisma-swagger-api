import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
// import { PrismaClient, User } from '@prismaClient/index'

// const prisma = new PrismaClient()

export let checkKeys = async (req: Request, res: Response, next: NextFunction) => {
    let api_key = req.header("x-api-key");
    let app_id = req.header("x-app-id");

    try {
        if (!api_key) throw "Api key is missing"
        if (!api_key) throw "App id is missing"
        if (api_key === process.env.API_KEY && app_id === process.env.APP_ID) {
            next();
        }
        else throw "Invalid api key or app id.";
    } catch (error) {
        return res.status(401).send({
            code: 401,
            message: error,
        });
    }
}

export let checkToken = async (req: Request, res: Response, next: NextFunction) => {
    const ACCESS_TOKEN_SECRET: Secret = process.env.ACCESS_TOKEN_SECRET || "";
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            throw "Invalid token";
        }
        const decodedToken: any = jwt.verify(token, ACCESS_TOKEN_SECRET);
        if (decodedToken.uid) {
            req.body.uid = decodedToken.uid;
            next();
        }
        else {
            throw "Invalid token";
        }
    } catch (error) {
        return res.status(401).send({
            code: 401,
            message: error,
        });
    }
}