import * as db from './db.js';
import express from 'express';

const app = express();

const configure = (client, vars) => {
  const { DB_NAME } = vars;

  app.get('/api/users', async (_request, response) => {
    try {
      let result = await db.findDocuments(client, DB_NAME, 'users', {});
      response.status(200).send(result);
    } catch (e) {
      console.error(e); // print on the server
      response.status(500).send(`${e}`); // send to the client
    }
  });
};

const startServer = (PORT) =>
  app.listen(PORT, console.warn(`Listening on port ${PORT}`));

export { configure, startServer };
