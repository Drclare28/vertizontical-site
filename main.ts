import { App, staticFiles } from "fresh";
import { type State } from "./utils.ts";

export const app = new App<State>()
  .use(staticFiles())
  .use(async (ctx) => {
    ctx.state.shared = "hello";
    return await ctx.next();
  })
  .fsRoutes();
