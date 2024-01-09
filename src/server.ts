import express from "express";
import dotenv from "dotenv";
import path from "path";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc";
import { nextApp, nextHandler } from "./nextUtils";
import { inferAsyncReturnType } from "@trpc/server";
import { getPayloadClient } from "./getPayload";
import bodyParser from "body-parser";
import { IncomingMessage } from "http";
import { stripeWebhookHandler } from "./webhooks";

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const app = express();
const PORT = Number(process.env.PORT) || 3000;

function createContext({ req, res }: trpcExpress.CreateExpressContextOptions) {
  return {
    req,
    res,
  };
}

export type WebhookRequest = IncomingMessage & { rawBody: Buffer };

async function start() {
  const webhookMiddleware = bodyParser.json({
    verify: (req: WebhookRequest, _, buffer) => {
      req.rawBody = buffer;
    },
  });

  app.post("/api/webhooks/stripe", webhookMiddleware, stripeWebhookHandler);

  const payload = await getPayloadClient({
    initOptions: {
      express: app,
      onInit: async (cms) => {
        cms.logger.info(`Admin URL ${cms.getAdminURL()}`);
      },
    },
  });

  app.use(
    "/api/trpc",
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  app.use((req, res) => nextHandler(req, res));

  nextApp.prepare().then(() => {
    payload.logger.info("Next.js is started");
    app.listen(PORT, async () => {
      payload.logger.info(
        `Next.js App URL: ${process.env.NEXT_PUBLIC_SERVER_URL}`
      );
    });
  });
}

start();

export type ExpressContext = inferAsyncReturnType<typeof createContext>;
