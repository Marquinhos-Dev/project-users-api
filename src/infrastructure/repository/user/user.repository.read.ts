import { IUser, UserRelations } from '../../../domain/user/interfaces/user.interface';
import { MUser } from '../../db/postgres/models/user.model';
import { AppDataSource } from '../../db/postgres/data-source';

export class UserRepositoryRead {
    // Get the Users Repository in database
    private userRepository = AppDataSource.getRepository(MUser);

    /**
     * Find a user by ID
     * @param id - The user's ID
     * @param relations - The user's relations valid
     * @returns The user document or null if not found
     */
    async findUserById(
        id: string,
        relations: UserRelations[] = [],
    ): Promise<IUser | null>
    {
        try {
            return await this.userRepository
            .findOne({
                where: { id },
                relations: relations,
            });
        } catch (error) {
            throw new Error(`Error finding user by ID: ${(error as Error).message}`);
        };
    };

    /**
     * Find a user by email
     * @param email - The user's email
     * @returns The user document or null if not found
     */
    async findUserByEmail(
        email: string
    ): Promise<IUser | null>
    {
        try {
            return await this.userRepository.findOneBy({ email });
        } catch (error) {
            throw new Error(`Error finding user by email: ${(error as Error).message}`,);
        };
    };

    /**
     * List all users with optional filtering
     * @param filter - Optional filters for the query
     * @param relations - The user relations valid
     * @returns An array of user documents
     */
    async listUsers(
        filter: Partial<IUser>,
        relations: UserRelations[] = [],
    ): Promise<IUser[]>
    {
        try {
            return await this.userRepository
            .find({
                where: filter,
                relations: relations,
            });
        } catch (error) {
            throw new Error(`Error listing users: ${(error as Error).message}`);
        };
    };
};