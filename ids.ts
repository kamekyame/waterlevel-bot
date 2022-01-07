export class Ids {
  private static dir = "./data/";
  private static path = Ids.dir + "users.json";

  public ids: string[] = [];
  constructor() {
    Deno.mkdirSync(Ids.dir, { recursive: true });
    this.readSync();
  }

  readSync() {
    try {
      const text = Deno.readTextFileSync(Ids.path);
      const data = JSON.parse(text) as Ids;
      this.ids.push(...data.ids);
    } catch {}
  }

  saveSync() {
    const text = JSON.stringify(this);
    Deno.writeTextFileSync(Ids.path, text);
  }

  addId(id: string) {
    this.ids.push(id);
    this.saveSync();
  }

  removeId(id: string) {
    this.ids = this.ids.filter((e) => e !== id);
    this.saveSync();
  }
}
