import { Router, Request, Response } from 'express';
import { PrismaClient, User } from '@prismaClient/index'
import bcrypt from 'bcrypt';
import jwt, { Secret } from "jsonwebtoken";
import ms from 'ms';

const prisma = new PrismaClient()

const router: Router = Router();


/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login endpoint
 *     description: Endpoint to authenticate users by email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: User ID
 *                       example: "123456"
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: User's email
 *                       example: "user@example.com"
 *                     auth:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: object
 *                           properties:
 *                             token:
 *                               type: string
 *                               description: Access token
 *                               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                             issued:
 *                               type: integer
 *                               description: Timestamp of token issuance
 *                               example: 1637434376
 *                             expires:
 *                               type: integer
 *                               description: Timestamp of token expiration
 *                               example: 1637520776
 *                         refreshToken:
 *                           type: object
 *                           properties:
 *                             token:
 *                               type: string
 *                               description: Refresh token
 *                               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                             issued:
 *                               type: integer
 *                               description: Timestamp of refresh token issuance
 *                               example: 1637434376
 *                             expires:
 *                               type: integer
 *                               description: Timestamp of refresh token expiration
 *                               example: 1637520776
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Success"
 *       '400':
 *         description: Invalid request or login failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: "Invalid email or password"
 */

router.post('/', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const ACCESS_TOKEN_SECRET: Secret = process.env.ACCESS_TOKEN_SECRET || ""
    const REFRESH_TOKEN_SECRET: Secret = process.env.REFRESH_TOKEN_SECRET || ""
    let expireIn = "15m"
    let refreshExpireIn = "30d"
    try {

        if (!email) throw "Email id cannot be empty"
        if (!password) throw "Password Id cannot be empty"

        const user: User | null = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!user) throw "Invalid Email or password"

        const checkPassword = await bcrypt.compare(password, user.password || "")

        if (!checkPassword) throw "Invalid Email or password"

        //Creating jwt token
        let token = jwt.sign(
            {
                uid: user.id,
                email: user.email
            },
            ACCESS_TOKEN_SECRET.toString(),
            {
                expiresIn: expireIn
            }
        );

        let refreshToken = jwt.sign(
            {
                uid: user.id,
                email: user.email
            },
            REFRESH_TOKEN_SECRET.toString(),
            {
                expiresIn: refreshExpireIn
            }
        );

        if (!token) throw "Error! Something went wrong"
        if (!refreshToken) throw "Error! Something went wrong"
        const decodedToken: any = jwt.verify(token, ACCESS_TOKEN_SECRET);
        const decodedRefToken: any = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

        await prisma.userToken.deleteMany({
            where: {
                userId: user.id,
            }
        });

        await prisma.userToken.create({
            data: {
                userId: user.id,
                token: refreshToken,
                iat: decodedRefToken.iat,
                exp: decodedRefToken.exp
            }
        });

        return res.status(200).send(
            {
                code: 200,
                data: {
                    id: user.id,
                    email: user.email,
                    auth: {
                        token: {
                            token,
                            issued: decodedToken.iat,
                            expires: decodedToken.exp
                        },
                        refreshToken: {
                            token: refreshToken,
                            issued: decodedRefToken.iat,
                            expires: decodedRefToken.exp
                        }
                    }
                },
                message: "Success",

            }
        );
    } catch (err) {
        return res.status(400).send({
            code: 400,
            data: null,
            message: err
        });
    }
});

export default router;

module.exports = router;
