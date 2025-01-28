import vars from './modules/vars.js';
import * as db from './modules/db.js';
import * as setup from './modules/setup.js';

let client = null;

try {
  client = await db.initDatabase(vars);
  if (process.argv[2] == '-r' || process.argv[2] == '--refresh') {
    await setup.refreshDatabase(client, vars);
  }

  let criteria = { email: { $regex: 'abc' } };
  let allEmailsWithABC = await db.findDocuments(
    client,
    vars.DB_NAME,
    'users',
    criteria
  );
  console.log(allEmailsWithABC);
} catch (e) {
  console.error(`${e}`);
} finally {
  await client?.close();
}
