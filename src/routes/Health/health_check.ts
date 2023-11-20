import { Router, Request, Response } from 'express';
const router: Router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Endpoint to check the health status of the service
 *     tags:
 *      - Health
 *     responses:
 *       '200':
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uptime:
 *                   type: number
 *                   description: Uptime of the service in seconds
 *                   example: 1234
 *                 message:
 *                   type: string
 *                   description: Health check status message
 *                   example: "Ok"
 *                 date:
 *                   type: string
 *                   format: date-time
 *                   description: Current date and time
 *                   example: "2023-11-20T12:00:00Z"
 *       '503':
 *         description: Service is unavailable
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uptime:
 *                   type: number
 *                   description: Uptime of the service in seconds
 *                   example: 1234
 *                 message:
 *                   type: string
 *                   description: Error message indicating service unavailability
 *                   example: "{\"message\": \"Database connection failed\"}"
 *                 date:
 *                   type: string
 *                   format: date-time
 *                   description: Current date and time
 *                   example: "2023-11-20T12:00:00Z"
 */

router.get('/', (req: Request, res: Response) => {
    let healthcheck = {
        uptime: process.uptime(),
        message: 'Ok',
        date: new Date()
    }
    try {
        res.status(200).send(healthcheck);
    } catch (error) {
        healthcheck.message = JSON.stringify(error);
        res.status(503).send(healthcheck);
    }

});

export default router;