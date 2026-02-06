import { IUser } from '../../../domain/user/interfaces/user.interface';
import { MUser } from '../../db/postgres/models/user.model';
import { AppDataSource } from '../../db/postgres/data-source';

export class UserRepositoryWrite {
    // Get the Users Repository in database
    private userRepository = AppDataSource.getRepository(MUser);

    /**
     *  Create a new user in the database
     *  @param userData - The user data to create
     *  @returns The created user document
    **/
    async createUser(
        userData: IUser
    ): Promise<IUser>
    {
        try {
            const user = this.userRepository.create(userData);
            return await this.userRepository.save(user);
        } catch (error) {
            throw new Error(`Error creating user: ${(error as Error).message}`);
        };
    };

    /**
     * Update a user by ID
     * @param id - The user's ID
     * @param updateData - The data to update
     * @returns The updated user document or null if not found
     */
    async updateUserById(
        id: string,
        updateData: Partial<IUser>,
    ): Promise<IUser | null>
    {
        try {
            await this.userRepository.update(id, updateData);
            return await this.userRepository.findOneBy({ id });
        } catch (error) {
            throw new Error(`Error updating user by ID: ${(error as Error).message}`);
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
            const user = await this.userRepository.findOneBy({ id });
            await this.userRepository.delete(id);
            return user;
        } catch (error) {
            throw new Error(`Error deleting user by ID: ${(error as Error).message}`);
        };
    };
};