export function request(): Promise<number> {
  return new Promise((resolve, reject) => {
    // センサーにリクエストする。
    // TCP送信…
    // 返ってきたとする。
    const waterlevel = Math.floor(Math.random() * 1000);
    resolve(waterlevel);
  });
}
