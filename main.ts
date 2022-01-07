async function tcpListen() {
  const listener = Deno.listen({ port: 10000 });
  for await (const res of listener) {
    const remoteNetAddr = res.remoteAddr as Deno.NetAddr;
    console.log("connected to " + remoteNetAddr.hostname);
    while (true) {
      const p = new Uint8Array(2);
      const a = await res.read(p);
      if (!a) break;
      console.log(a, p);
    } //Deno.copy(res, res);
    res.close();
    console.log("disconnected to " + remoteNetAddr.hostname);
  }
}
tcpListen();

import { config } from "https://deno.land/x/dotenv/mod.ts";
const env = config({ safe: true });

import { Client, Webhook } from "./line-bot-sdk-deno/mod.ts";

import { Ids } from "./ids.ts";
import { request } from "./waterlevel.ts";

const ids = new Ids();

const client = new Client({ channelAccessToken: env.CHANNEL_ACCESS_TOKEN });

const webhook = new Webhook({ channelSecret: env.CHANNEL_SECRET }, (req) => {
  if (req.events.length === 0) return;
  req.events.forEach(async (e) => {
    if (e.type === "message") {
      if (e.message.type === "text") {
        if (e.message.text === "水位") {
          if (!e.replyToken) return;
          const level = await request();
          client.replyMessage(e.replyToken, {
            type: "text",
            text: `現在の水位は ${level / 10}cm です。`,
          });
          console.log("水位返答");
        }
        //console.log(res);
      }
    } else if (e.type === "follow") {
      if (e.source.type === "user") {
        ids.addId(e.source.userId);
        console.log("友だち追加orブロック解除", e.source.userId);
      }
    } else if (e.type === "unfollow") {
      if (e.source.type === "user") {
        ids.removeId(e.source.userId);
        console.log("ブロック", e.source.userId);
      }
    } else if (e.type === "join") {
      if (e.source.type === "group") {
        ids.addId(e.source.groupId);
        console.log("グループ・トークルーム参加", e.source.groupId);
      }
    } else if (e.type === "leave") {
      if (e.source.type === "group") {
        ids.removeId(e.source.groupId);
        console.log("グループ・トークルーム退出", e.source.groupId);
      }
    }
  });
});

webhook.listen("/test/");

const nextDay = () => new Date().setHours(21, 18, 0, 0) + 24 * 60 * 60 * 1000;
const tommorowFromNow = () => nextDay() - new Date().getTime();

setTimeout(async () => {
  const level = await request();
  ids.ids.forEach(async (id) => {
    const res = await client.pushMessage(id, {
      type: "text",
      text: `現在の水位は ${level / 10}cm です。`,
    });
    console.log(res);
  });
  //  code
}, tommorowFromNow());
