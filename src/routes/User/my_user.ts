import { Router, Request, Response } from 'express';
import { PrismaClient, User } from '@prismaClient/index'
import { isValidObjectId } from "../../utils/helpers"

const prisma = new PrismaClient()

const router: Router = Router();

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get user information endpoint
 *     description: Endpoint to retrieve user information
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
 *     responses:
 *       '200':
 *         description: User information retrieved successfully
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
 *                     displayName:
 *                       type: string
 *                       description: User's display name
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: User's email
 *                       example: "user@example.com"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: User creation timestamp
 *                       example: "2023-11-20T12:00:00Z"
 *                     fcm_token:
 *                       type: string
 *                       description: User's FCM token
 *                       example: "FCMToken123"
 *                     imageUrl:
 *                       type: string
 *                       description: User's profile image URL
 *                       example: "https://example.com/profile.jpg"
 *                     phone:
 *                       type: string
 *                       description: User's phone number
 *                       example: "+1234567890"
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Success"
 *       '404':
 *         description: User information not found or invalid user ID
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
 *                   example: "Invalid user ID"
 *     security:
 *       - BearerAuth: []
 * securitySchemes:
 *   BearerAuth:
 *     type: http
 *     scheme: bearer
 */

router.get('/', async (req: Request, res: Response) => {
    let { uid } = req.body
    try {
        if (!isValidObjectId(uid)) throw "Invalid User"

        let user = await prisma.user.findFirst({
            where: {
                id: uid,
            },
            select: {
                id: true,
                displayName: true,
                email: true,
                createdAt: true,
                password: false,
                fcm_token: true,
                imageUrl: true,
                phone: true
            }
        });
        if (!user) throw "User info not found"

        return res.status(200).send({
            code: 200,
            data: user,
            message: "Success",
        })
    } catch (error) {
        return res.status(404).send({
            code: 404,
            data: {},
            message: error,
        })
    }

});

export default router;
module.exports = router;