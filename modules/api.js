import * as db from './db.js';
import * as setup from './setup.js';
import express, { request } from 'express';
import cors from 'cors';

const app = express();
app.use(express.json()); // middleware to parse JSON bodies (allows us to use request.body)
app.use(cors()); // middleware to enable CORS (Cross-Origin Resource Sharing) for requests
app.use(express.static('public')); // configure express to host the public folder (contains client side code)

app.use((req, _res, next) => {
  const timestamp = new Date(Date.now());
  console.log(`[${timestamp.toDateString()} ${timestamp.toTimeString()}] / ${timestamp.toISOString()}`);
  console.log(req.method, req.hostname, req.path);
  console.log('headers:', req.headers);
  console.log('body:', req.body);
  next();
});

const configure = (client, vars) => {
  const { DB_NAME } = vars;

  app.get('/api/users', async (request, response) => {
    try {
      //console.log(request.query);
      let criteria = {}; // this will hold the formated contents of the request query strings if any are given
      for (let [key, value] of Object.entries(request.query)) {
        criteria[key] = {
          $regex: value, // will not give us an exact mach so "Foo" input would still find "Foo Bar"
          $options: 'i', // ingore case
        };
      }
      //console.log(criteria);
      let result = await db.findDocuments(client, DB_NAME, 'users', criteria);
      //console.log(result);
      response.status(200).send(result);
    } catch (e) {
      console.error(e); // print on the server
      response.status(500).send(`${e}`); // send to the client
    }
  });

  app.post('/api/users', async (request, response) => {
    try {
      let result = await db.insertDocument(client, DB_NAME, 'users', request.body);
      response.status(200).send(result);
    } catch (e) {
      console.error(e);
      response.status(500).send(`${e}`);
    }
  });

  // update user by email
  app.put('/api/users/:email', async (request, response) => {
    try {
      let result = await db.updateDocument(
        client,
        DB_NAME,
        'users',
        { email: request.params.email }, // critera to filter the document to update with an exact match on email
        request.body // update document with the new fields
      );

      response.status(200).send(result);
    } catch (e) {
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

  // refresh database endpoint
  app.post('/api/refresh', async (request, response) => {
    try {
      await setup.refreshDatabase(client, vars);
      response.status(200).json({ message: 'Database refreshed' });
    } catch (e) {
      console.error(e);
      response.status(500).json({ error: e.toString() });
    }
  });

  // TRAVEL ADVISORY ENDPOINTS
  app.get('/api/alerts', async (_request, response) => {
    let projection = {
      _id: 0,
      country_code: 1,
      country_name: 1,
    };

    try {
      let result = await db.findDocuments(client, DB_NAME, 'alerts', {}, projection);
      response.send(result);
    } catch (e) {
      console.error(e);
      console.log(`${e}`);
      response.status(500).send([]);
    }
  });

  app.get('/api/alerts/:country_code', async (request, response) => {
    const { country_code } = request.params;
    try {
      let result = await db.findDocument(client, DB_NAME, 'alerts', { country_code });
      response.send(result);
    } catch (e) {
      console.error(e);
      console.log(`${e}`);
      response.status(500).send([]);
    }
  });

  // BOOKMARK ENDPOINTS

  // get all bookmarked countires (not in full detail)
  app.get('/api/bookmarks', async (_request, response) => {
    let projection = {
      _id: 0,
      country_code: 1,
      country_name: 1,
    };
    try {
      let result = await db.findDocuments(client, DB_NAME, 'bookmarks', {}, projection);
      response.send(result);
    } catch (e) {
      console.error(e);
      console.log(`${e}`);
      response.status(500).send([]);
    }
  });

  // gets full details of a bookmarked country
  app.get('/api/bookmarks/:country_code', async (request, response) => {
    const { country_code } = request.params;
    try {
      let result = await db.findDocument(client, DB_NAME, 'bookmarks', { country_code });
      response.send(result);
    } catch (e) {
      console.error(e);
      console.log(`${e}`);
      response.status(500).send([]);
    }
  });

  app.post('/api/bookmarks', async (request, response) => {
    try {
      let result = await db.insertDocument(client, DB_NAME, 'bookmarks', request.body);
      response.status(200).send(result);
    } catch (e) {
      console.error(e);
      response.status(500).send(`${e}`);
    }
  });

  app.delete('/api/bookmarks/:country_code', async (request, response) => {
    try {
      let result = await db.deleteDocument(client, DB_NAME, 'bookmarks', {
        country_code: {
          $regex: request.params.country_code,
          $options: 'i',
        },
      });
      response.status(200).send(result);
    } catch (e) {
      console.error(e);
      response.status(500).send(`${e}`);
    }
  });

  // Handles Client-Side Routing Requests
  // Any request that doesn't match an API endpoint above will be served the index.html file
  // At this point in the code, we know the request is not an API request
  app.use((_request, response) => response.sendFile('index.html', { root: 'public' }));

  // Application level middleware that will catch all unhandled routes
  // Must be last in configuration
  // Like a default switch statement!
  app.use((request, response) => response.send(`${request.path} didn't match any route`));
};

const startServer = (PORT) => app.listen(PORT, console.warn(`Listening on port ${PORT}`));

export { configure, startServer };
