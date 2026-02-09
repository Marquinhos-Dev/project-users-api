import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

// Interface para tipar o payload do token (os dados que salvamos no login)
interface ITokenPayload {
    id: string;
    email: string;
    iat: number;
    exp: number;
}

// Estendemos a interface Request para que o TypeScript aceite "req.user"
// Isso permite acessar o ID do usuário dentro dos controllers se necessário
declare global {
    namespace Express {
        interface Request {
            user?: Partial<ITokenPayload>;
        }
    }
}

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    // 1. Verifica se o header existe
    if (!authHeader) {
        res.status(401).json({ error: 'Token not provided' });
        return;
    }

    // 2. O formato geralmente é "Bearer <token>", então dividimos a string
    // [0] = "Bearer", [1] = "eyJhGci..."
    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        res.status(401).json({ error: 'Token error' });
        return;
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
        res.status(401).json({ error: 'Token malformatted' });
        return;
    }

    try {
        // 3. Verifica a validade do token
        // A chave secreta deve ser a mesma usada no UserService.login
        const secret = process.env.JWT_SECRET || 'SEU_SECRET_KEY';

        const decoded = jwt.verify(token, secret);

        // 4. Anexa o ID do usuário na requisição para uso posterior
        req.user = decoded as ITokenPayload;

        // 5. Passa para o próximo handler (o Controller)
        return next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
        return;
    }
};