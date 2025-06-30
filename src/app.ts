import { App, ExpressReceiver } from "@slack/bolt";
import dotenv from "dotenv";
import registerExport from "./commands/export";
import registerAsk from "./commands/ask";
import { config } from "./config/env";

dotenv.config();

const receiver = new ExpressReceiver({
  signingSecret: config.SLACK_SIGNING_SECRET!,
});

const app = new App({
  token: config.SLACK_BOT_TOKEN!,
  receiver,
});

registerExport(app);
registerAsk(app);

receiver.app.listen(config.PORT, () => {
  console.log(`⚡️ ConvoLens running on port ${config.PORT}`);
});
