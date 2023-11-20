import express, { Express } from 'express';
import dotenv from 'dotenv';
import 'module-alias/register';
import path from 'path';

import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import helmet from "helmet";
import { checkToken, checkKeys } from "./middlewares/credentials_checker";
import healthCheck from "./routes/Health/health_check";

dotenv.config();

const corsOptions = {
    origin: '*',
    credentials: true,
    optionsSuccessStatus: 200,
};

const app: Express = express();
const port = process.env.PORT;

app.set('trust proxy', true)
app.use(cors(corsOptions));
app.use(helmet.hidePoweredBy());
app.use(helmet.xssFilter());
app.use(helmet.crossOriginEmbedderPolicy());
app.use(helmet.crossOriginOpenerPolicy());
app.use(helmet.crossOriginResourcePolicy());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.frameguard());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.originAgentCluster());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(morgan("tiny"));
// app.use(morgan(logger.logFormat, { stream: writer }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/static', express.static('src/public'))


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/index.html'));
})

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, '../src/public/images/rrad-logo-500x500-1-90x90.png'));
})

app.use('/health', healthCheck);

app.use('/docs',
    require("./swager"),
);

app.use('/auth',
    // checkKeys,
    require("./routes/Auth/index"),
);
app.use('/user',
    // checkKeys,
    require("./routes/User/index"),
);

// app.use('/domain',
//     checkKeys,
//     checkToken,
//     require("./routes/Domain/index"),
// );


app.get("*", (req, res) => {
    res.send("Naughty! Naughty! You teasing me?");
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    // prisma.$connect().then((value) => {
    //     console.log(`⚡️[db]: DB is connected`);
    //  });
});