import { Router, Request, Response } from 'express';
import { PrismaClient, UserToken } from '@prismaClient/index'
import { isValidObjectId } from '../../utils/helpers';
import jwt, { Secret } from "jsonwebtoken";
import ms from 'ms';

const prisma = new PrismaClient()

const router: Router = Router();

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Refresh user token endpoint
 *     description: Endpoint to refresh user authentication tokens
 *     tags: [ Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Token refreshed successfully
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
 *                   example: "Delete Success"
 *       '404':
 *         description: Token refresh failed or invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *                   example: "Invalid Refresh Token"
 */

router.post('/', async (req: Request, res: Response) => {
    let { refreshToken } = req.body;
    try {
        const REFRESH_TOKEN_SECRET: Secret = process.env.REFRESH_TOKEN_SECRET || ""
        const ACCESS_TOKEN_SECRET: Secret = process.env.ACCESS_TOKEN_SECRET || ""
        let expireIn = "15m"
        if (!refreshToken) throw "Invalid Refresh Token"
        // if (!isValidObjectId(ouid)) throw "Invalid Organization User id"

        let userToken: UserToken | null = await prisma.userToken.findFirst({
            where: {
                token: refreshToken,
            }
        });

        if (!userToken) throw "Invalid token";

        const decodedRefToken: any = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        if (!decodedRefToken) throw "Something went wrong."

        let token = jwt.sign(
            {
                uid: decodedRefToken.uid,
                email: decodedRefToken.email
            },
            ACCESS_TOKEN_SECRET.toString(),
            {
                expiresIn: expireIn
            }
        );
        // const currentTimeAsMs = Date.now();
        const decodedToken: any = jwt.verify(token, ACCESS_TOKEN_SECRET);

        if (!token) throw "Something went wrong."
        console.log(decodedRefToken)
        return res.status(200).send({
            code: 200,
            data: {
                id: decodedRefToken.uid,
                email: decodedRefToken.email,
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
            message: "Delete Success",
        });
    } catch (error) {
        return res.status(404).send({
            code: 404,
            data: {},
            message: error
        });
    }
});

export default router;
module.exports = router