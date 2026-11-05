import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "node:path";
import { existsSync } from "node:fs";
import { gridRoutes } from "./routes/grids";
import { personRoutes } from "./routes/persons";
import { visitRoutes } from "./routes/visits";

async function main() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  app.get("/api/health", async () => ({
    ok: true,
    service: "rural-grid-server",
    time: new Date().toISOString(),
  }));

  await app.register(gridRoutes);
  await app.register(personRoutes);
  await app.register(visitRoutes);

  // 生产环境：由后端托管前端构建产物，做到「单服务、单 URL」
  const webDist = path.resolve(__dirname, "../../web/dist");
  if (existsSync(webDist)) {
    await app.register(fastifyStatic, {
      root: webDist,
      prefix: "/",
      index: "index.html",
    });
    app.setNotFoundHandler((req, reply) => {
      if (req.raw.url && req.raw.url.startsWith("/api")) {
        reply.code(404).send({ error: "Not Found" });
        return;
      }
      reply.sendFile("index.html");
    });
  }

  const port = Number(process.env.PORT ?? 4000);
  await app.listen({ port, host: "0.0.0.0" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
