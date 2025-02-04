import vars from './modules/vars.js';
import * as db from './modules/db.js';
import * as cli from './modules/cli.js';
import * as api from './modules/api.js';

try {
  let client = await db.initDatabase(vars);
  await cli.processArgs(client, vars); // if any valid arguments are passed process will exit after this line
  api.configure(client, vars);
  api.startServer(vars.PORT);
} catch (e) {
  console.error(`${e}`);
}
