/* eslint-disable @typescript-eslint/no-explicit-any */
import initSqlJs from '@jlongster/sql.js'
import { SQLiteFS } from 'absurd-sql'
import IndexedDBBackend from 'absurd-sql/dist/indexeddb-backend'
import { formatSQLResult, uuidv4 } from '../utils'
import { Tables } from '../../util/types'
import migration from './migration.sql?raw'

let db: any
let SQL: any
const version = '0.1'
const channel = new BroadcastChannel('sqlite')
const controller = { started: false }

channel.addEventListener('message', (evt) => {
  const { data } = evt

  if (
    typeof data === 'string' &&
    !['{', '}', '[', ']'].some((key) => data.includes(key)) &&
    db
  ) {
    const res = exec(db, data)
    channel.postMessage(JSON.stringify(res))
  }

  if (typeof data === 'object') {
    const { start, stop, reset } = data
    if (start) return initDB()
    if (stop) return
    if (reset && db) return resetDB(db)
  }
})

const exec = <T>(db: any, sql: string) => {
  if (import.meta.env.DEV) console.log(sql)
  return formatSQLResult<T>(db.exec(sql))
}

const resetDB = (db: any) => {
  try {
    exec(
      db,
      `PRAGMA writable_schema = 1;
      DELETE FROM sqlite_master;
      PRAGMA writable_schema = 0;
      VACUUM;
      PRAGMA integrity_check;`
    )
    channel.postMessage({ status: false })
    controller.started = false
  } catch (e) {
    console.log(e instanceof Error ? e.message : '')
  }
}

const seedDB = (db: any, version: string) => {
  try {
    const tables = [
      'Supermarket',
      'Wholesale',
      'ProductSupermarket',
      'List',
      'ProductList',
      'Reciept',
      'ProductReciept',
      'User',
    ]
    const values = tables
      .map((table) => `('${uuidv4()}', '${table}', '${version}', true)`)
      .join(', ')
    const sql = `INSERT INTO Tables (id, name, version, sync) VALUES ${values}`
    exec(db, sql)
  } catch (e) {
    console.log(
      `Falha ao alimentar tabelas do DB\n${console.log(
        e instanceof Error ? e.message : ''
      )}`
    )
  }
}

const createDB = (db: any) => {
  try {
    exec(db, migration)
    if (import.meta.env.DEV) console.log('tentou alimentar o DB')
    seedDB(db, version)
  } catch (e) {
    const data = exec<Tables>(
      db,
      `SELECT * FROM Tables ORDER BY ROWID ASC LIMIT 1`
    )
    if (data && data[0] && data[0].version !== version) {
      if (import.meta.env.DEV) console.log(`entrou no reset: ${version}`)
      resetDB(db)
      createDB(db)
      seedDB(db, version)
    }
  }
}

const initDB = async () => {
  const path = '/sql/db.sqlite'
  if (controller.started) return
  if (!SQL) {
    SQL = await initSqlJs({
      locateFile: (file: string) => '/assets/' + file,
    })
    const sqlFS = new SQLiteFS(SQL.FS, new IndexedDBBackend())
    SQL.register_for_idb(sqlFS)

    SQL.FS.mkdir('/sql')
    SQL.FS.mount(sqlFS, {}, '/sql')

    if (typeof SharedArrayBuffer === 'undefined') {
      const stream = SQL.FS.open(path, 'a+')
      await stream.node.contents.readIfFallback()
      SQL.FS.close(stream)
    }
  }

  db = new SQL.Database(path, { filename: true })
  // You might want to try `PRAGMA page_size=8192;` too!
  exec(db, `PRAGMA journal_mode=MEMORY;`)

  controller.started = true
  channel.postMessage({ status: true })
  createDB(db)
}
