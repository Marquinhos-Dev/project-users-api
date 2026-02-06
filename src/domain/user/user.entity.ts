import { IUser } from "./interfaces/user.interface";

export class User {
    name: string;
    email: string;
    password: string;

    constructor({
        name,
        email,
        password,
    }: IUser)
    {
        this.name = name;
        this.email = email;
        this.password = password;
    };
};