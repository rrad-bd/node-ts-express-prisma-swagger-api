import { Router, Request, Response } from 'express';
import { PrismaClient, User } from '@prismaClient/index'
import { isValidObjectId } from "../../utils/helpers"

const prisma = new PrismaClient()

const router: Router = Router();

/**
 * @swagger
 * /user/update_fcm_token:
 *   post:
 *     summary: Update user's FCM token endpoint
 *     description: Endpoint to update the FCM token for a user
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fcm_token:
 *                 type: string
 *     responses:
 *       '200':
 *         description: FCM token updated successfully
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
 *                     password:
 *                       type: string
 *                       description: User's password (excluded)
 *                     fcm_token:
 *                       type: string
 *                       description: Updated FCM token
 *                       example: "UpdatedToken123"
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
 *                   example: "Invalid User"
 *     security:
 *       - BearerAuth: []
 * securitySchemes:
 *   BearerAuth:
 *     type: http
 *     scheme: bearer
 */

router.post('/', async (req: Request, res: Response) => {
    let { uid, fcm_token } = req.body
    try {
        if (!isValidObjectId(uid)) throw "Invalid User"
        if (!fcm_token) throw "Valid fcm_token required."

        let user = await prisma.user.update({
            where: {
                id: uid,
            },
            data: {
                fcm_token: fcm_token
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
