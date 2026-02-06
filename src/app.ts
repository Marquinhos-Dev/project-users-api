import { Server } from './domain/server/server';

const app = new Server({
    port: Number(process.env.PORT) || 3000,
});

(async () => {
    await app.init();
    app.listen();
})();