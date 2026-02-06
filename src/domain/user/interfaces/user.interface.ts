export interface IUser {
    id?: string;
    name: string;
    email: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
};

// Nested relations
export type UserRelations =
    'example' |
    'example.author' |
    'example.author.posts'