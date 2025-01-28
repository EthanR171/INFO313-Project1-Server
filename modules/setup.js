import * as fs from 'node:fs/promises';
import * as db from './db.js';

const downloadData = async (vars) => {
  const { DATA_DIRECTORY, ADVISORY_JSON_URL, ADVISORY_JSON_FILENAME } = vars;

  let response = await fetch(ADVISORY_JSON_URL);
  let text = await response.text();

  const filePath = `${DATA_DIRECTORY}/${ADVISORY_JSON_FILENAME}`;
  await fs.writeFile(filePath, text);
  console.warn(`${text.length} characters saved to ${ADVISORY_JSON_FILENAME}`);
};

const refreshDatabase = async (client, vars) => {
  const { DB_NAME, DATA_DIRECTORY, USERS_JSON_FILENAME } = vars;

  await downloadData(vars);

  let usersFile = await fs.readFile(`${DATA_DIRECTORY}/${USERS_JSON_FILENAME}`);
  let usersText = await usersFile.toString();
  let users = await JSON.parse(usersText);

  await db.deleteDatabase(client, DB_NAME);
  await db.insertDocuments(client, DB_NAME, 'users', users);
  console.warn(`${users.length} users added to ${DB_NAME}.users`);
};

export { downloadData, refreshDatabase };
