import * as db from './db.js';
import express, { request } from 'express';

const app = express();
app.use(express.json()); // middleware to parse JSON bodies (allows us to use request.body)

const configure = (client, vars) => {
  const { DB_NAME } = vars;

  app.get('/api/users', async (request, response) => {
    try {
      //console.log(request.query);
      let criteria = {}; // this will hold the formated contents of the request query strings if any are given
      for (let [key, value] of Object.entries(request.query)) {
        criteria[key] = {
          $regex: value,
          $options: 'i', // ingore case
        };
      }

      console.log(criteria);

      let result = await db.findDocuments(client, DB_NAME, 'users', criteria);
      response.status(200).send(result);
    } catch (e) {
      console.error(e); // print on the server
      response.status(500).send(`${e}`); // send to the client
    }
  });

  app.post('/api/users', async (request, response) => {
    try {
      let result = await db.insertDocument(
        client,
        DB_NAME,
        'users',
        request.body
      );
      response.status(200).send(result);
    } catch (e) {
      console.error(e);
      response.status(500).send(`${e}`);
    }
  });

  // note: anything after the colon is a variable contained in the request object
  // we need the middleware to parse the JSON as defined by app.use(express.json())
  app.delete('/api/users/:email', async (request, response) => {
    try {
      let result = await db.deleteDocument(client, DB_NAME, 'users', {
        email: {
          $regex: request.params.email,
          $options: 'i',
        },
      });
      response.status(200).send(result);
    } catch (e) {
      console.error(e);
      response.status(500).send(`${e}`);
    }
  });
};

const startServer = (PORT) =>
  app.listen(PORT, console.warn(`Listening on port ${PORT}`));

export { configure, startServer };
