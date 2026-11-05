import Fastify from "fastify";
import cors from "@fastify/cors";

async function main() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  app.get("/api/health", async () => ({
    ok: true,
    service: "rural-grid-server",
    time: new Date().toISOString(),
  }));

  const port = Number(process.env.PORT ?? 4000);
  await app.listen({ port, host: "0.0.0.0" });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
