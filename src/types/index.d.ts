import { FindOperator } from "typeorm";

// Um tipo que representa os valores possíveis em uma cláusula 'where' do TypeORM.
// Inclui primitivos, operadores (Like, In, etc.) e arrays.
type WhereValue =
    | string
    | number
    | boolean
    | Date
    | FindOperator<any>
    | WhereValue[];

declare namespace Express {
    export interface Request {
        filter?: { [key: string]: WhereValue | undefined };
    };
};