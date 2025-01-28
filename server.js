import vars from './modules/vars.js';
import * as db from './modules/db.js';
import * as setup from './modules/setup.js';

let client = null;

try {
  client = await db.initDatabase(vars);
  await setup.refreshDatabase(client, vars);
} catch (e) {
  console.error(`${e}`);
} finally {
  await client?.close();
}
