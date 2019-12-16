import Knex from 'knex';

const knex = Knex({
  client: process.env.DB_ENGINE,
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  }
});

export default knex;

export enum Format {
  JSON = 'JSON',
  XML = 'XML'
}

export enum Operator {
  BEAUTIFY_JSON = 'BEAUTIFY_JSON',
  CONVERT_JSON_TO_XML = 'CONVERT_JSON_TO_XML'
}
