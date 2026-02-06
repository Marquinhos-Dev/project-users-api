import express, {
    Request,
    Response,
    Application,
    NextFunction,
    RequestHandler,
} from 'express';
import { ContextAsyncHooks, Logger } from 'traceability';
import { Server as httpServer } from 'http';
import { IController } from './interfaces/IController';
import helmet from 'helmet';
import { HttpError } from 'express-openapi-validator/dist/framework/types';
import { AppDataSource } from '../../infrastructure/db/postgres/data-source';
import * as ControllerFactories from '../../configuration/factory';
import cors from 'cors';

export class Server {
    public app: Application;

    public port: number;

    public apiSpecLocation?: string;

    private readonly timeoutMilliseconds?: number;

    private readonly middleWaresToStart = [
        express.json({ limit: '3mb' }),
        express.urlencoded({ limit: '3mb', extended: true }),
        ContextAsyncHooks.getExpressMiddlewareTracking(),
        helmet(),
    ];

    constructor(appInit: {
        port: number;
        originAllowed?: string[] | RegExp[];
        corsWithCredentials?: boolean;
        middlewaresToStart?: Array<RequestHandler>;
        apiSpecLocation?: string;
        databaseURI?: string;
        customizers?: Array<
            (application: Application, fileDestination: string) => void
        >;
        timeoutMilliseconds?: number;
    }) {
        this.app = express();
        this.port = appInit.port;
        this.apiSpecLocation = appInit.apiSpecLocation;
        this.timeoutMilliseconds = appInit.timeoutMilliseconds;
        const corsOptions = {
            origin: appInit.originAllowed || '*', // Define quem pode acessar
            credentials: appInit.corsWithCredentials, // Define se aceita cookies/headers de auth
        };
        this.app.use(cors(corsOptions));
    };

    public async init(): Promise<void> {
        
        await this.databaseSetup();
        this.middlewares(this.middleWaresToStart);
        this.routes(this.controllers());
        this.customizers();
        
        this.app.get('/health', (req: Request, res: Response) => {
            res.status(200).json({ status: 'OK' });
        });
    };

    private controllers(): Array<IController>{
        return Object.values(ControllerFactories).map(factory => factory.create());
    };

    private middlewares(middleWares: Array<RequestHandler>) {
        middleWares.forEach((middleWare) => this.app.use(middleWare));
        /*
        this.app.use(
            OpenApiValidator.middleware({
                apiSpec: this.apiSpecLocation || '',
                validateApiSpec: true,
                validateResponses: true,
            }),
        );
        */
    };

    private customizers() {
        this.app.use(
        (err: Error, req: Request, res: Response, _next: NextFunction) => {
            if (err instanceof HttpError) {
                if (err.status === 500) {
                    Logger.error(JSON.stringify(err));
                };
                res.status(err.status).json({ message: err.message });
                return;
            }
            if (err instanceof Error) {
                Logger.error(
                    JSON.stringify({
                    eventName: 'server.error',
                    message: err.message,
                    stack: err.stack,
                    }),
                );
            };
            res.status(500).json({
                message: 'Internal Server Error',
            });
        });
    };

    private routes(controllers: Array<IController>, pathRoute = '/') {
        controllers.forEach((controller) =>
            this.app.use(pathRoute, controller.getRoutes()),
        );
    };

    public async databaseSetup() {
        try {
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
                console.log('Connect to Database');
            };
        } catch (error) {
            console.error(`Error to connect - ${error}`);
            console.log(error)
            process.exit(1);
        };
    };

    public async closeDatabase() {
        if (AppDataSource && AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('Database disconnect');
        };
    };

    public listen(): httpServer {
        return this.app
        .listen(this.port, () => {
            Logger.info(`App listening on the http://localhost:${this.port}`, {
            eventName: 'start_listening',
            process: 'Application',
            });
        })
        .setTimeout(this.timeoutMilliseconds || 30000);
    };
};