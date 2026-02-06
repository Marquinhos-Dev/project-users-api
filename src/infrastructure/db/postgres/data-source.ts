import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import { AppEntities } from "./models";
import { allEntities } from "./models";
import { AppMigrations } from "./migrations";
import { allMigrations } from "./migrations";

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: `${process.env.DATABASE_URL}`,
    synchronize: false,
    logging: true,
    entities: allEntities as Array<AppEntities>,
    migrations: allMigrations as Array<AppMigrations>,
});