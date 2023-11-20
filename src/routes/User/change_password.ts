import { Router, Request, Response } from 'express';
import { PrismaClient, User } from '@prismaClient/index'
import bcrypt from 'bcrypt';
import jwt, { Secret } from "jsonwebtoken";
import { isValidObjectId } from '../../utils/helpers';

const prisma = new PrismaClient()

const router: Router = Router();

/**
 * @swagger
 * /user/change-password:
 *   post:
 *     summary: Change user password endpoint
 *     description: Endpoint to change a user's password
 *     tags:
 *      - User
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *           format: bearer
 *           description: Bearer token for user authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uid:
 *                 type: string
 *               password:
 *                 type: string
 *               prevPassword:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Password successfully changed
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
 *         description: Invalid request or password change failed
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
 *                   example: "Invalid user ID"
 *     security:
 *       - BearerAuth: []
 * securitySchemes:
 *   BearerAuth:
 *     type: http
 *     scheme: bearer
 */

router.post('/', async (req: Request, res: Response) => {
    const { uid, password, prevPassword } = req.body;
    const ACCESS_TOKEN_SECRET: Secret = process.env.ACCESS_TOKEN_SECRET || ""
    const REFRESH_TOKEN_SECRET: Secret = process.env.REFRESH_TOKEN_SECRET || ""

    let expireIn = "15m"
    let refreshExpireIn = "30d"
    const saltRounds: number = 8

    try {
        if (!uid) throw "User id cannot be empty"
        if (!password) throw "Password id cannot be empty"
        if (!prevPassword) throw "Previous Password id cannot be empty"

        if (!isValidObjectId(uid)) throw "Invalid User"

        const user: User | null = await prisma.user.findUnique({
            where: {
                id: uid,
            }
        });

        if (!user) throw "Invalid user"

        const checkPrevPassword = await bcrypt.compare(prevPassword, user.password || "")
        const checkCurrentPassword = await bcrypt.compare(password, user.password || "")

        if (!checkPrevPassword) throw "Invalid password"
        if (checkCurrentPassword) throw "Cannot be same password"

        let passHass = await bcrypt.hash(password, saltRounds);

        const updatedUser: User | null = await prisma.user.update({
            where: {
                id: uid,
            },
            data: {
                password: passHass,
            }
        });

        if (!updatedUser) throw "Failed updating passwords"

        //Creating jwt token
        let token = jwt.sign(
            {
                uid: updatedUser.id,
                email: updatedUser.email
            },
            ACCESS_TOKEN_SECRET.toString(),
            {
                expiresIn: expireIn
            }
        );

        let refreshToken = jwt.sign(
            {
                uid: updatedUser.id,
                email: updatedUser.email
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
                        },
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