import { IUserRepositoryRead } from '../repository/user.repository.read';
import { IUserRepositoryWrite } from '../repository/user.repository.write';
import {
    IParamsCreateUser,
    IParamsUpdateUser,
    IParamsUserService,
    IUserService,
} from '../interfaces/user.service.interface';
import { IUser, UserRelations } from '../interfaces/user.interface';
import { User } from '../user.entity';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export class UserService implements IUserService {
    private userRepositoryRead: IUserRepositoryRead;
    private userRepositoryWrite: IUserRepositoryWrite;

    constructor({ userRepositoryRead, userRepositoryWrite }: IParamsUserService) {
        this.userRepositoryRead = userRepositoryRead;
        this.userRepositoryWrite = userRepositoryWrite;
    };

    /**
     * Create a new user
     * @param params - The user data to create
     * @returns The created user document
     */
    async createUser(
        params: IParamsCreateUser
    ): Promise<IUser>
    {
        try {
            const existingUser = await this.userRepositoryRead.findUserByEmail(
                params.email,
            );
            if (existingUser) {
                throw new Error('A user with this email already exists');
            };

            // === ALTERAÇÃO AQUI ===
            // Criptografa a senha antes de criar a entidade/salvar
            const hashedPassword = await bcrypt.hash(params.password, 10);
            
            // Cria a entidade com a senha hasheada
            const userEntity = new User({
                ...params,
                password: hashedPassword
            });
            // ======================

            return await this.userRepositoryWrite.createUser(userEntity);
        } catch (error) {
            throw new Error(`Error creating user: ${(error as Error).message}`);
        };
    };

    /**
     * Authenticate a user
     * @param email - User email
     * @param password - User password (plain text)
     * @returns Object containing user and token
     */
    async login(email: string, password: string): Promise<{ user: IUser, token: string }> {
        try {
            // 1. Busca o usuário pelo e-mail (usando seu método existente ou repo direto)
            const user = await this.userRepositoryRead.findUserByEmail(email);
            
            if (!user) {
                throw new Error('Invalid email or password');
            }

            // 2. Compara a senha enviada com a hash salva no banco
            // IMPORTANTE: Isso assume que você salvou a senha como hash no createUser
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                throw new Error('Invalid email or password');
            }

            // 3. Gera o Token JWT
            const token = jwt.sign(
                { id: user.id, email: user.email }, 
                'SEU_SECRET_KEY', // Substitua por process.env.JWT_SECRET
                { expiresIn: '1h' }
            );

            // Retorna o usuário e o token (é boa prática remover a senha do objeto de retorno)
            // user.password = undefined; // Opcional: remover a senha do objeto retornado
            
            return { user, token };

        } catch (error) {
            throw new Error((error as Error).message);
        }
    }

    /**
     * Get a user by ID
     * @param id - The user's ID
     * @returns The user document or null if not found
     */
    async getUserById(
        id: string,
        relations: UserRelations[] = [],
    ): Promise<IUser | null>
    {
        try {
            const user = await this.userRepositoryRead.findUserById(id, relations);
            if (!user) {
                throw new Error('User not found');
            };
            return user;
        } catch (error) {
            throw new Error(`Error retrieving user by ID: ${(error as Error).message}`);
        };
    };

    /**
     * Get a user by email
     * @param email - The user's email
     * @returns The user document or null if not found
     */
    async getUserByEmail(
        email: string
    ): Promise<IUser | null>
    {
        try {
            const user = await this.userRepositoryRead.findUserByEmail(email);
            if (!user) {
                throw new Error('User not found');
            };
            return user;
        } catch (error) {
            throw new Error(`Error retrieving user by email: ${(error as Error).message}`);
        };
    };

    /**
     * List all users with optional filters
     * @param filter - Filters for the query
     * @returns An array of user documents
     */
    async listUsers(
        filter: Partial<IUser> = {},
        relations: string | null,
    ): Promise<IUser[]>
    {
        try {
            const relationsArray = relations ? relations.split(',') : [];
            return await this.userRepositoryRead.listUsers(
                filter,
                relationsArray as UserRelations[]
            );
        } catch (error) {
            throw new Error(`Error listing users: ${(error as Error).message}`);
        };
    };

    /**
     * Update a user's information by ID
     * @param id - The user's ID
     * @param updateData - The data to update
     * @returns The updated user document or null if not found
     */
    async updateUserById(
        data: IParamsUpdateUser,
    ): Promise<IUser | null>
    {
        try {
            const user = await this.userRepositoryRead.findUserById(data.id);
            if (!user) {
                throw new Error('User not found');
            };
            return await this.userRepositoryWrite.updateUserById(data.id, { ...data.userData });
        } catch (error) {
            throw new Error(`Error updating user: ${(error as Error).message}`);
        };
    };

    /**
     * Delete a user by ID
     * @param id - The user's ID
     * @returns The deleted user document or null if not found
     */
    async deleteUserById(
        id: string
    ): Promise<IUser | null>
    {
        try {
            const user = await this.userRepositoryRead.findUserById(id);
            if (!user) {
                throw new Error('User not found');
            };
            await this.userRepositoryWrite.deleteUserById(id);
            return user;
        } catch (error) {
            throw new Error(`Error deleting user: ${(error as Error).message}`);
        };
    };
};