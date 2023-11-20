import { Router, Request, Response } from 'express';
const router: Router = Router();
import path from 'path';
const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express");
const yaml = require('yaml');
const fs = require("fs")

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "LockScreen Rental API",
            version: "0.1.0",
            description:
                "Lock Screen Rental API documentation",
            contact: {
                name: "Robust Research and Development Ltd.",
                url: "https://rrad.ltd",
                email: "info@rrad.ltd",
            },
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    in: 'header',
                    name: 'Authorization',
                    description: 'Bearer Token',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        tags: [
            { name: 'Health', description: 'Operations related to server health' },
            { name: 'Authentication', description: 'Operations related to authentication' },
            { name: 'User', description: 'Operations related to user authentication and information' },
        ],
        servers: [
            {
                url: "http://localhost:6969",
                description: "Development Server"
            }, {
                url: "https://api.lockscreenrental.com",
                description: "Production Server"
            },
        ],
    },
    apis: [
        path.join(__dirname, "/routes/User/*.js"),
        path.join(__dirname, "/routes/Health/*.js"),
        path.join(__dirname, "/routes/Auth/*.js"),
    ],
};

const specs = swaggerJsdoc(options);

// Convert Swagger specs to YAML format
// const specsYaml = yaml.stringify(specs);
// fs.writeFile('./swager.yml', specsYaml, (err: any) => {
//     if (err) {
//         console.log(err);
//     }
// });

router.use(
    "/",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
        explorer: false,
        customSiteTitle: "LockScreen Rental API",
        customfavIcon: "/favicon.ico",
        customCss: `
                    .topbar-wrapper img {content:url(\'/static/images/rrad-logo.png\'); width:auto; height:40px;}
                    .swagger-ui .topbar { background-color: black; }
                    `,
        swaggerOptions: {
            validatorUrl: null,
            displayRequestDuration: true,
            docExpansion: "list",
            filter: true,
            deepLinking: true,
            layout: "StandaloneLayout",
            displayOperationId: true,
        },
    })
);

export default router;
module.exports = router;