import { join } from 'path'
import { JSONFileSync } from 'lowdb/node'
import { generateMockData } from '../api/mock-data.mjs'
import lodash from 'lodash';
import { LowSyncWithLodash } from './lowdb-lodash.mjs';
import pluralize from 'pluralize';

let db = null;

const initDB = (basePath) => {

    if (db) return;
    const adapter = new JSONFileSync(join(basePath, 'db.json'));
    const dbAccess = new LowSyncWithLodash(adapter, {})
    dbAccess.write()
    db = dbAccess;
}

const seedDB = (definition, count = 3) => {

    const resource = pluralize.plural(`${definition.resource.toLowerCase()}`);

    const jsonRows = {
        [resource]: Array.from({ length: count }, () => generateMockData(definition)),
    };

    db.read();

    db.data = lodash.merge(db.data, jsonRows);

    db.write();
}


export { db, initDB, seedDB }