import * as Types from "./types.ts";
import { MESSAGING_API_PREFIX } from "./endpoints.ts";

export default class Client {
  private config: Types.ClientConfig;

  constructor(config: Types.ClientConfig) {
    if (!config.channelAccessToken) throw new Error("no channel access token");
    this.config = config;
  }

  toArray<T>(maybeArr: T | T[]): T[] {
    return Array.isArray(maybeArr) ? maybeArr : [maybeArr];
  }

  async lineFetch(
    input: string | Request | URL,
    init?: RequestInit | undefined,
  ) {
    const res = await fetch(input, {
      ...init,
      headers: new Headers({
        "content-type": "application/json",
        "Authorization": "Bearer " + this.config.channelAccessToken,
      }),
    });
    if (res.status === 200) return res;
    else {
      console.error(res.status, res.statusText);
      const data = await res.json();
      console.error(data);
    }
  }

  async replyMessage(
    replyToken: string,
    messages: Types.Message | Types.Message[],
    notificationDisabled: boolean = false,
  ) {
    return await this.lineFetch(`${MESSAGING_API_PREFIX}/message/reply`, {
      method: "POST",
      body: JSON.stringify({
        messages: this.toArray(messages),
        replyToken,
        notificationDisabled,
      }),
    });
  }
  async pushMessage(
    to: string,
    messages: Types.Message | Types.Message[],
    notificationDisabled: boolean = false,
  ) {
    return await this.lineFetch(`${MESSAGING_API_PREFIX}/message/push`, {
      method: "POST",
      body: JSON.stringify({
        messages: this.toArray(messages),
        to,
        notificationDisabled,
      }),
    });
  }
}
