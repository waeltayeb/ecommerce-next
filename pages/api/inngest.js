// pages/api/inngest.js
import { serve } from "inngest/next";
import { inngest, syncUserCreation, syncUserUpdate, syncUserDeletion, createUserOrder } from "@/config/inngest";

export default serve({
  client: inngest,
  functions: [
    syncUserCreation,
    syncUserUpdate,
    syncUserDeletion,
    createUserOrder
  ],
});
