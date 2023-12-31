import { Router, Request, Response } from 'express';
import { PrismaClient, User } from '@prismaClient/index'
import bcrypt from 'bcrypt';
import jwt, { Secret } from "jsonwebtoken";

const prisma = new PrismaClient()

const router: Router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: User registration endpoint
 *     description: Endpoint to register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: User registered successfully
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
 *         description: Invalid request or email already exists
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
 *                   example: "Email already exists."
 *       '403':
 *         description: Forbidden - Registration failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 403
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: "Invalid request."
 */

router.post('/', async (req: Request, res: Response) => {
    let name = req.body.name;
    let email = req.body.email;
    let password = req.body.password;

    const ACCESS_TOKEN_SECRET: Secret = process.env.ACCESS_TOKEN_SECRET || ""
    const REFRESH_TOKEN_SECRET: Secret = process.env.REFRESH_TOKEN_SECRET || ""
    let expireIn = "15m"
    let refreshExpireIn = "30d"
    const saltRounds: number = 8

    try {
        if (!name) throw "Name cannot be empty"
        if (!email) throw "Email id cannot be empty"
        if (!password) throw "Password Id cannot be empty"

        let passHass = await bcrypt.hash(password, saltRounds);

        let user: any = await prisma.user.create({
            data: {
                displayName: name,
                email: email,
                password: passHass
            }
        });
        if (!user) throw "Failed creating user"
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
        if (!token) throw "Error! Something went wrong.";
        if (!refreshToken) throw "Error! Something went wrong.";

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
    } catch (error: any) {
        if (error.code === "P2002") {
            return res.status(400).send({
                code: 400,
                data: null,
                message: "Email already exists."
            });
        }
        else {
            return res.status(403).send({
                code: 403,
                data: null,
                message: error
            });
        }

    }
});

export default router;
module.exports = router;