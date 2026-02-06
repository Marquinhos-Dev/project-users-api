import { Request, Response, NextFunction } from 'express';
import {
    FindOperator,
    Equal,
    Not,
    LessThan,
    LessThanOrEqual,
    MoreThan,
    MoreThanOrEqual,
    Between,
    In,
    Like,
    ILike,
} from 'typeorm';

const OPERATORS_MAP: { [key: string]: (...args: any[]) => FindOperator<any> } = {
    eq: Equal,
    not: Not,
    lt: LessThan,
    lte: LessThanOrEqual,
    gt: MoreThan,
    gte: MoreThanOrEqual,
    between: Between,
    in: In,
    like: Like,
    ilike: ILike,
};

export function configFilter( // TODO: verificar lógica e testar
    req: Request,
    res: Response,
    next: NextFunction
) {
    const filter: Request['filter'] = {};
    const query = req.query;

    for (const key in query) {
        const match = key.match(/(\w+)\[(\w+)\]/);

        if (!match) {
            continue;
        };

        const [_, field, operator] = match;
        let value: any = query[key] as string;

        if (OPERATORS_MAP[operator]) {
            const typeormOperator = OPERATORS_MAP[operator];

            if (['in', 'between'].includes(operator)) {
                value = value.split(',');
            };

            if (operator === 'between') {
                if (value.length === 2) {
                    filter[field] = typeormOperator(value[0], value[1]);
                };
            } else {
                filter[field] = typeormOperator(value);
            };
        };
    };

    req.filter = filter;

    next();
};