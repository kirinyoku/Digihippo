import express from "express";
import dotenv from "dotenv";
import path from "path";
import payload, { Payload } from "payload";
import next from "next";
import type { InitOptions } from "payload/config";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter } from "./trpc";
import nodemailer from "nodemailer";
import { inferAsyncReturnType } from "@trpc/server";

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  secure: true,
  port: 465,
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY,
  },
});

let cached = (global as any).payload;

if (!cached) {
  cached = (global as any).payload = {
    client: null,
    promise: null,
  };
}

interface Args {
  initOptions?: Partial<InitOptions>;
}

export async function getPayloadClient({
  initOptions,
}: Args = {}): Promise<Payload> {
  if (!process.env.PAYLOAD_SECRET) {
    throw new Error("PAYLOAD_SECRET is missing");
  }

  if (cached.client) {
    return cached.client;
  }

  if (!cached.promise) {
    cached.promise = payload.init({
      email: {
        transport: transporter,
        fromAddress: "onboarding@resend.com",
        fromName: "DigiHippo",
      },
      secret: process.env.PAYLOAD_SECRET || "",
      local: initOptions?.express ? false : true,
      ...(initOptions || {}),
    });
  }

  try {
    cached.client = await cached.promise;
  } catch (error: unknown) {
    throw error;
  }

  return cached.client;
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

function createContext({ req, res }: trpcExpress.CreateExpressContextOptions) {
  return {
    req,
    res,
  };
}

const nextApp = next({
  dev: process.env.NODE_ENV !== "production",
  port: PORT,
});

const nextHandler = nextApp.getRequestHandler();

async function start() {
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
