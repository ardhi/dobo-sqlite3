import path from 'path'

async function sqlite3DriverFactory () {
  const { DoboKnexDriver } = this.app.baseClass
  const { uniq } = this.app.lib._

  class DoboSqlite3Driver extends DoboKnexDriver {
    constructor (plugin, name, options) {
      super(plugin, name, options)
      this.dialect = 'sqlite3'
      this.adapter = 'sqlite3'
      this.options = {
        useNullAsDefault: true
      }
    }

    async sanitizeConnection (item) {
      await super.sanitizeConnection(item)
      const { fs } = this.app.lib
      const { getPluginDataDir } = this.app.bajo
      const { isString, isEmpty } = this.app.lib._
      if (!isString(item.filename)) this.plugin.fatal('keyIsRequired%s%s%s', 'filename', this.plugin.t('connection'), item.name, { payload: item })
      if (item.filename === ':memory:') item.memory = true
      else {
        let file = item.filename
        if (file.indexOf('/') === -1) {
          file = `${getPluginDataDir('dobo')}/db/${file}`
          const ext = path.extname(file)
          if (isEmpty(ext)) file += '.sqlite3'
          fs.ensureDirSync(path.dirname(file))
        } else {
          if (file.indexOf('{appDir}') > -1) file = file.replace('{appDir}', this.app.dir)
          if (file.indexOf('{dataDir}') > -1) file = file.replace('{dataDir}', this.app.bajo.dir.data)
          if (file.indexOf('{tmpDir}') > -1) file = file.replace('{tmpDir}', this.app.bajo.dir.tmp)
        }
        item.filename = file
      }
    }

    async buildModel (model, options = {}) {
      await super.buildModel(model, options)
      const fullTexts = model.indexes.filter(idx => idx.type === 'fulltext')
      if (fullTexts.length === 0) return

      const client = model.connection.client
      function getCols () {
        const columns = []
        for (const idx of fullTexts) {
          columns.push(...idx.fields)
        }
        return uniq(columns)
      }

      function printCols (prefix) {
        let cols = [...getCols()]
        if (prefix) cols = cols.map(c => `${prefix}.${c}`)
        return cols.join(', ')
      }

      const columns = getCols().join(', ')
      const stmtSchema = `
        CREATE VIRTUAL TABLE ${model.name}_fts USING fts5 (
          ${printCols()}, content = '${model.name}', content_rowid = '${this.idField.name}'
        );
      `
      const stmtTriggerInsert = `
        CREATE TRIGGER ${model.name}_fts_insert AFTER INSERT ON ${model.name}
        BEGIN
          INSERT INTO ${model.name}_fts (rowid, ${columns}) VALUES (new.id, ${printCols('new')});
        END;
      `
      const stmtTriggerDelete = `
        CREATE TRIGGER ${model.name}_fts_delete AFTER DELETE ON ${model.name}
        BEGIN
          INSERT INTO ${model.name}_fts (${model.name}_fts, rowid, ${columns}) VALUES ('delete', old.id, ${printCols('old')});
        END;
      `

      const stmtTriggerUpdate = `
        CREATE TRIGGER ${model.name}_fts_update AFTER UPDATE ON ${model.name}
        BEGIN
          INSERT INTO ${model.name}_fts (${model.name}_fts, rowid, ${columns}) VALUES ('delete', old.id, ${printCols('old')});
          INSERT INTO ${model.name}_fts (rowid, ${columns}) VALUES (new.id, ${printCols('new')});
        END;
      `
      await client.raw(stmtSchema)
      await client.raw(stmtTriggerInsert)
      await client.raw(stmtTriggerDelete)
      await client.raw(stmtTriggerUpdate)
    }

    async dropModel (model, options = {}) {
      await super.dropModel(model, options)
      const client = model.connection.client
      const fulltexts = model.indexes.filter(idx => idx.type === 'fulltext')
      if (fulltexts.length > 0) await client.schema.dropTable(`${model.name}_fts`)
    }

    _reformHistogram ({ type, item, group, aggregates, field }) {
      const aggs = []
      for (const agg of aggregates) {
        aggs.push(`${agg}(${agg === 'count' ? '*' : field}) as ${agg}`)
      }
      switch (type) {
        case 'daily': {
          item.sql = item.sql.replace('*', `strftime('%Y-%m-%d', substr(${group}, 1, 10), 'auto') as date, ${aggs.join(', ')}`)
          const start = item.sql.indexOf(' order by ')
          const end = item.sql.indexOf(' limit ')
          // const order = item.sql.slice(start, end)
          item.sql = item.sql.splice(start, end - start, '')
          // item.sql = item.sql.replace('limit ', `group by strftime('%Y', substr(${group}, 1, 10), 'auto'), strftime('%m', substr(${group}, 1, 10), 'auto'), strftime('%d', substr(${group}, 1, 10), 'auto') ${order} limit `)
          item.sql = item.sql.replace('limit ', 'group by date limit ')
          break
        }
        case 'monthly': {
          item.sql = item.sql.replace('*', `strftime('%Y-%m', substr(${group}, 1, 10), 'auto') as month, ${aggs.join(', ')}`)
          // item.sql = item.sql.replace('limit ', `group by strftime('%Y', substr(${group}, 1, 10), 'auto'), strftime('%m', substr(${group}, 1, 10), 'auto') limit `)
          item.sql = item.sql.replace('limit ', 'group by month limit ')
          break
        }
        case 'yearly': {
          item.sql = item.sql.replace('*', `cast(strftime('%Y', substr(${group}, 1, 10), 'auto') as integer) as year, ${aggs.join(', ')}`)
          // item.sql = item.sql.replace('limit ', `group by strftime('%Y', substr(${group}, 1, 10), 'auto') limit `)
          item.sql = item.sql.replace('limit ', 'group by year limit ')
          break
        }
      }
    }
  }

  this.app.DoboSqlite3Driver = DoboSqlite3Driver
  return DoboSqlite3Driver
}

export default sqlite3DriverFactory
