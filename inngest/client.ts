import { Inngest } from "inngest";
import { realtimeMiddleware } from "@inngest/realtime/middleware";
// Create a client to send and receive events
export const inngest = new Inngest({
  id: "xdesign-app",
  signingKey: process.env.INNGEST_SIGNING_KEY,
  middleware: [realtimeMiddleware()],
});
