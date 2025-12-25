# Supported Drivers

By default, [Knex](https://knexjs.org) support the following databases:

- [PostgreSQL](https://www.postgresql.org), [CockrouchDB](https://www.cockroachlabs.com) and [Amazon Redshift](https://aws.amazon.com/redshift) through [pg](https://github.com/brianc/node-postgres) adapter.
- [MySQL](https://www.mysql.com) and [MariaDB](https://mariadb.org) through [mysql](https://github.com/felixge/node-mysql) adapter.
- [SQLite3](https://sqlite.org) through [sqlite3](https://github.com/mapbox/node-sqlite3) adapter.
- [MSSQL](https://www.microsoft.com/en-us/sql-server) through [tedious](https://github.com/tediousjs/tedious) adapter.

In addition to those listed above, Dobo Knex also supports the following databases with some custom patches to ensure they work as smoothly as it possible:

- [Manticoresearch](https://github.com/manticoresoftware/manticoresearch) through [mysql](https://github.com/felixge/node-mysql) adapter.

## Example MySQL

- Package install:

  ```bash
  $ npm install mysql dobo dobo-knex
  ```
- ```{dataDir}/config/.plugins``` file:

  ```txt
  ...
  dobo
  dobo-knex
  ...
  ```
- ```{dataDir}/config/dobo.json``` file:

  ```json
  {
    "connections": [{
      "name": "default",
      "type": "dbknex:mysql",
      "connection": {
        "host": "localhost",
        "user": "myuser",
        "password": "mypassword",
        "database": "mydb"
      }
    }]
  }
  ```

## Example SQLite3

- Package install:

  ```bash
  $ npm install sqlite3 dobo dobo-knex
  ```
- ```{dataDir}/config/.plugins``` file:

  ```txt
  ...
  dobo
  dobo-knex
  ...
  ```
- ```{dataDir}/config/dobo.json``` file:

  ```json
  {
    "connections": [{
      "name": "default",
      "type": "dbknex:sqlite3",
      "connection": {
        "filename": "mydatabase.sqlite3"
      }
    }]
  }
  ```
