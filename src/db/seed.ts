import db from '../index.ts';
import * as schema from './schema.ts';
import { seed, reset } from 'drizzle-seed'; 

async function main() {
    await reset(db, schema);
    await seed(db, schema);
    console.log('Seed successful');
    console.log(`Connected to database on port: ${db.$client.options.port}`);
    db.$client.end();
}

main();