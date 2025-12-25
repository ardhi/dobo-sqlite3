# Config Object


## Dobo's connection object

These SQLite3 connection objects should be used as your **Dobo connection** object's array written in your ```{dataDir}/config/dobo.json```, NOT in ```{dataDir}/config/doboSqlite3.json```.

| Key Name | Type | Default | Description |
| ------- | ---- | ----- | ----------- |
| ```name``` | ```string``` | ```default``` | Connection name |
| ```type``` | ```string``` || Connection's driver type. See below |
| ```connection``` | ```object``` || Connection details |
| &nbsp;&nbsp;&nbsp;&nbsp;```filename``` | ```string``` || Path to database file |
| &nbsp;&nbsp;&nbsp;&nbsp;```...``` ||| See knex *connection* config |
| ```useNullAsDefault``` | ```boolean``` | ```true``` | See knex options |
| ```...``` ||| See knex options |

Directory to database file, if not specifed, defaults to ```{dataDir}/plugins/dobo/db/{filename}```

if ```{filename}``` is ```:memory:```, it turns on SQLite3 memory database

Directory tokens are supported, it will be replaced by its respected values if any are found:
- ```{appDir}```
- ```{dataDir}```
- ```{tmpDir}```
