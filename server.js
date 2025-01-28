import vars from './modules/vars.js';
import * as db from './modules/db.js';
import * as setup from './modules/setup.js';

let client = null;

try {
  client = await db.initDatabase(vars);
  if (process.argv[2] == '-r' || process.argv[2] == '--refresh') {
    await setup.refreshDatabase(client, vars);
  }
} catch (e) {
  console.error(`${e}`);
} finally {
  await client?.close();
}
