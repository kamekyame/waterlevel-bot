import { createApp, ServerRequest } from "https://servestjs.org/@v1.2.0/mod.ts";

import * as Types from "./types.ts";
import { SignatureValidationFailed } from "./exceptions.ts";
import validateSignature from "./validate-signature.ts";

export class Webhook {
  private config: Types.MiddlewareConfig;
  private func: (res: Types.WebhookRequestBody) => void;
  private app = createApp();

  constructor(
    config: Types.MiddlewareConfig,
    callback: (res: Types.WebhookRequestBody) => void,
  ) {
    this.config = config;
    this.func = callback;
  }

  public handler = async (req: ServerRequest) => {
    const signature = req.headers.get("x-line-signature");
    if (!signature) throw new SignatureValidationFailed("no signature");

    if (
      !validateSignature(await req.text(), this.config.channelSecret, signature)
    ) {
      throw new SignatureValidationFailed(
        "signature validation failed",
        signature,
      );
    }
    await req.respond({ status: 200 });

    const webhook = await req.json() as Types.WebhookRequestBody;
    this.func(webhook);
  };

  listen(pattern: string) {
    this.app.handle(pattern, this.handler);
    this.app.catch((e, req) => {
      console.error(e);
      if (e instanceof SignatureValidationFailed) {
        req.respond({ status: 401, body: e.signature });
      } else {
        req.respond({ status: 500 });
      }
    });
    this.app.listen({
      port: 8000,
    });
  }
}
