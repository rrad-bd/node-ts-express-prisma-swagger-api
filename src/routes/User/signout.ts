import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prismaClient/index'
import { isValidObjectId } from '../../utils/helpers';

const prisma = new PrismaClient()

const router: Router = Router();

/**
 * @swagger
 * /user/signout:
 *   post:
 *     summary: User sign out endpoint
 *     description: Endpoint to sign out a user and delete associated tokens
 *     tags: [User]
 *     responses:
 *       '200':
 *         description: User signed out successfully
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
 *                 message:
 *                   type: string
 *                   example: "Success"
 *       '404':
 *         description: User not found or invalid user ID
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
 *                   example: "User not found."
 *     security:
 *       - BearerAuth: []
 * securitySchemes:
 *   BearerAuth:
 *     type: http
 *     scheme: bearer
 */

router.post('/', async (req: Request, res: Response) => {
    let { uid } = req.body;
    try {
        if (!isValidObjectId(uid)) throw "Invalid User id"
        await prisma.userToken.deleteMany({
            where: {
                userId: uid,
            }
        });
        return res.status(200).send({
            code: 200,
            data: {},
            message: "Success",
        });
    } catch (error) {
        return res.status(404).send({
            code: 404,
            data: {},
            message: "User not found."
        });
    }
});

export default router;
module.exports = router
