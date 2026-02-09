import { Router, Request, Response, RequestHandler } from 'express';
import { IController } from '../../domain/server/interfaces/IController';
import { UserService } from '../../domain/user/service/user.service';
import { IUser } from 'src/domain/user/interfaces/user.interface';

export class UserController implements IController {
    router: Router;
    private readonly userService: UserService;
    private authMiddlware: RequestHandler;

    constructor(
        userService: UserService,
        authMiddlware: RequestHandler
    ) {
        this.userService = userService;
        this.authMiddlware = authMiddlware;
        this.router = Router();
        this.initRoutes();
    };

    initRoutes() {
        this.router.post('/login', this.login);

        // this.router.use(authMiddlware)

        this.router.get('/users', this.getUsers);
        this.router.get('/users/:id', this.getUserById);
        this.router.post('/users', this.createUser);
        this.router.put('/users/:id', this.updateUser);
        this.router.delete('/users/:id', this.deleteUser);
    };

    /**
     * Fetch a user by ID
     */
    getUserById = async (
       req: Request<{ id: string }>,
       res: Response,
    ): Promise<void> => {
        const { id } = req.params;
        try {
            const user = await this.userService.getUserById(id);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            };
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        };
    };

    login = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        const { email, password } = req.body;

        try {
            const result = await this.userService.login(email, password);
            res.status(200).json(result);
        } catch (error) {
            // Retornamos 401 (Unauthorized) para falhas de login
            res.status(401).json({ error: (error as Error).message });
        }
    };

    /**
     * Fetch all users
     */
    getUsers = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const { relations, ...filter } = req.query;
            const users = await this.userService
            .listUsers(
                filter as Partial<IUser>,
                relations as string | null,
            );
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        };
    };

    /**
     * Create a new user
     */
    createUser = async (
        req: Request,
        res: Response,
    ): Promise<void> => {
        const { name, email, password } = req.body;
        try {
            const newUser = await this.userService.
            createUser({
                name,
                email,
                password,
            });
            res.status(201).json(newUser);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        };
    };

    /**
     * Update a user's information by ID
     */
    updateUser = async (
        req: Request,
        res: Response,
    ): Promise<void> => {
        const { id } = req.params;
        const updateData = req.body;
        try {
            const updatedUser = await this.userService.updateUserById({
                id: id as string,
                userData: updateData,
            });
            if (!updatedUser) {
                res.status(404).json({ message: 'User not found' });
                return;
            };
            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        };
    };

    /**
     * Delete a user by ID
     */
    deleteUser = async (
        req: Request,
        res: Response,
    ): Promise<void> => {
        const { id } = req.params;
        try {
            const deletedUser = await this.userService.deleteUserById(id as string);
            if (!deletedUser) {
                res.status(404).json({ message: 'User not found' });
                return;
            };
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: (error as Error).message });
        };
    };

    /**
     * Get the router with all routes
     */
    public getRoutes(): Router {
        return this.router;
    };
};
