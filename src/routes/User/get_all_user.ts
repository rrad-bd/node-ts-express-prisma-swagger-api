import { Router, Request, Response } from 'express';
import { PrismaClient, User } from '@prismaClient/index'

const prisma = new PrismaClient()

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
    let allUsers = await prisma.user.findMany({
        select: {
            id: true,
            displayName: true,
            email: true,
            createdAt: true,
            password: false
        }
    });
    if (allUsers.length > 0) {
        return res.status(200).send({
            code: 200,
            data: allUsers,
            message: "All users list",
            count: allUsers.length,
        });
    }
    else {
        return res.status(404).send({
            code: 404,
            data: [],
            message: "Users not found."
        });
    }
});

export default router;
module.exports = router;