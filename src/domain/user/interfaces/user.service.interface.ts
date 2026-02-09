import { IUserRepositoryRead } from '../repository/user.repository.read';
import { IUserRepositoryWrite } from '../repository/user.repository.write';
import { IUser } from './user.interface';

export interface IParamsCreateUser {
    name: string;
    email: string;
    password: string;
};

export interface IParamsUpdateUser {
    id: string;
    userData: Partial<IUser>;
};

export interface IParamsUserService {
    userRepositoryRead: IUserRepositoryRead;
    userRepositoryWrite: IUserRepositoryWrite;
};

/**
 * Interface para a resposta do Login
 * Contém o usuário encontrado e o token gerado
 */
export interface ILoginResponse {
    user: IUser;
    token: string;
}

export interface IUserService {
    /**
     * Realiza o login do usuário
     * @param email Email do usuário
     * @param password Senha (texto plano)
     */
    login(
        email: string, 
        password: string
    ): Promise<ILoginResponse>;

    createUser(
        params: IParamsCreateUser
    ): Promise<IUser>;
    
    getUserById(
        id: string
    ): Promise<IUser | null>;
    
    getUserByEmail(
        email: string
    ): Promise<IUser | null>;

    listUsers(
        filter: Partial<IUser>,
        relations: string | null,
    ): Promise<IUser[]>;

    updateUserById(
        data: IParamsUpdateUser
    ): Promise<IUser | null>;
    
    deleteUserById(
        id: string
    ): Promise<IUser | null>;
};