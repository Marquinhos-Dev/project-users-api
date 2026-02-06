import { MUser } from "./user.model";

export const allEntities = [
    MUser,
];

export type AppEntities = typeof allEntities[number];