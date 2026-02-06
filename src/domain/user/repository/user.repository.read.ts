import { IUser, UserRelations } from '../interfaces/user.interface';

export interface IUserRepositoryRead {
    findUserById(
        id: string,
        relations?: UserRelations[],
    ): Promise<IUser | null>;

    findUserByEmail(
        email: string,
    ): Promise<IUser | null>;

    listUsers(
        filter: Partial<IUser>,
        relations?: UserRelations[],
    ): Promise<IUser[]>;
};