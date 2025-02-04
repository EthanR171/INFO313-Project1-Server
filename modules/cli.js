import * as db from './db.js';
import * as setup from './setup.js';

const processArgs = async (client, vars) => {
  let collection, field, valueMatch, criteria, format, queryResults;

  switch (process.argv[2]) {
    case '-r':
    case '--refresh':
      await setup.refreshDatabase(client, vars);
      process.exit(0);
    case '-f':
    case '--find':
      if (process.argv.length < 6) {
        console.error('Error: Not enough arguments');
        console.error(
          'Usage: node server.js -f <collection> <field> <value-match>'
        );
        process.exit(1);
      }
      // logic to find documents
      collection = process.argv[3];
      field = process.argv[4];
      valueMatch = process.argv[5];
      criteria = { [field]: { $regex: valueMatch } };

      // figure out format based on collection
      switch (collection) {
        case 'users':
          format = { _id: 0, name: 1 }; // only show name
          break;
        case 'alerts':
          format = { _id: 0, country_name: 1 }; // only show country_name
          break;
        default:
          format = { _id: 0 };
      }

      queryResults = await db.findDocuments(
        client,
        vars.DB_NAME,
        collection,
        criteria,
        format
      );
      console.log(queryResults);
      process.exit(0);
  }
};

export { processArgs };
