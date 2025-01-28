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

  let users = await loadUsers(`${DATA_DIRECTORY}/${USERS_JSON_FILENAME}`);

  await db.deleteDatabase(client, DB_NAME);
  await db.insertDocuments(client, DB_NAME, 'users', users);
  console.warn(`${users.length} users added to ${DB_NAME}.users`);
};

const loadUsers = async (filePath) => {
  let usersFile = await fs.readFile(filePath);
  let usersText = await usersFile.toString();
  let users = await JSON.parse(usersText);
  console.warn(`${users.length} user(s) read from ${filePath}`);
  return users;
};

const loadISOData = async (filePath) => {
  let isoFile = await fs.readFile(filePath);
  let isoText = await isoFile.toString();
  let isoCountries = await JSON.parse(isoText);
  console.warn(`${isoCountries.length} ISO countries read from ${filePath}`);
  return isoCountries;
};

const loadAdvisories = async (filePath) => {
  let advisoriesFile = await fs.readFile(filePath);
  let advisoriesText = await advisoriesFile.toString();
  let advisoriesObject = await JSON.parse(advisoriesText);
  let advisories = advisoriesObject['data'];
  console.warn(
    `${Object.keys(advisories).length} advisories read from ${filePath}`
  );
  return advisories;
};

export { downloadData, refreshDatabase };
