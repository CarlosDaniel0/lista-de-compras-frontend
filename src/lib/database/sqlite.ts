/* eslint-disable @typescript-eslint/no-explicit-any */
import initSqlJs from '@jlongster/sql.js'
import { SQLiteFS } from 'absurd-sql'
import IndexedDBBackend from 'absurd-sql/dist/indexeddb-backend'
import { formatSQLResult, uuidv4 } from '../utils'
import { Tables } from '../../util/types'

let db: any
const version = '0.1'
const channel = new BroadcastChannel('sqlite')

const exec = <T>(db: any, sql: string) => {
  if (import.meta.env.DEV) console.log(sql)
  return formatSQLResult<T>(db.exec(sql))
}

const resetSQLiteDB = (db: any) => {
  try {
    exec(
      db,
      `PRAGMA writable_schema = 1;
      DELETE FROM sqlite_master;
      PRAGMA writable_schema = 0;
      VACUUM;
      PRAGMA integrity_check;`
    )
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
    exec(
      db,
      `-- CreateTable
CREATE TABLE "Supermarket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "sync" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Wholesale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "min_quantity" DECIMAL NOT NULL,
    "price" DECIMAL NOT NULL,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "sync" BOOLEAN NOT NULL DEFAULT false,
    "product_id" TEXT NOT NULL,
    CONSTRAINT "Wholesale_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ProductSupermarket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Coordinates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lat" REAL NOT NULL,
    "long" REAL NOT NULL,
    "supermarket_id" TEXT NOT NULL,
    CONSTRAINT "Coordinates_supermarket_id_fkey" FOREIGN KEY ("supermarket_id") REFERENCES "Supermarket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductSupermarket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "unity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "barcode" TEXT,
    "price" DECIMAL NOT NULL,
    "last_update" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "sync" BOOLEAN NOT NULL DEFAULT false,
    "supermarket_id" TEXT NOT NULL,
    CONSTRAINT "ProductSupermarket_supermarket_id_fkey" FOREIGN KEY ("supermarket_id") REFERENCES "Supermarket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "List" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "date" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "sync" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    CONSTRAINT "List_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "unity" TEXT,
    "quantity" REAL NOT NULL,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "sync" BOOLEAN NOT NULL DEFAULT false,
    "list_id" TEXT NOT NULL,
    "product_id" TEXT,
    "supermarket_id" TEXT,
    CONSTRAINT "ProductList_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ProductSupermarket" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProductList_supermarket_id_fkey" FOREIGN KEY ("supermarket_id") REFERENCES "Supermarket" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProductList_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "List" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reciept" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL NOT NULL,
    "discount" DECIMAL NOT NULL,
    "supermarket_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "sync" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Reciept_supermarket_id_fkey" FOREIGN KEY ("supermarket_id") REFERENCES "Supermarket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reciept_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductReciept" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "index" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    "price" DECIMAL NOT NULL,
    "total" DECIMAL NOT NULL,
    "removed" BOOLEAN NOT NULL DEFAULT false,
    "sync" BOOLEAN NOT NULL DEFAULT false,
    "receipt_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    CONSTRAINT "ProductReciept_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "Reciept" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductReciept_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ProductSupermarket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "picture" TEXT
);

-- CreateTable
CREATE TABLE "Tables" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "sync" BOOLEAN NOT NULL DEFAULT true
);

-- CreateIndex
CREATE UNIQUE INDEX "Wholesale_product_id_key" ON "Wholesale"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "Coordinates_supermarket_id_key" ON "Coordinates"("supermarket_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
`
    )
    if (import.meta.env.DEV) console.log('tentou alimentar o DB')
    seedDB(db, version)
  } catch (e) {
    const data = exec<Tables>(
      db,
      `SELECT * FROM Tables ORDER BY ROWID ASC LIMIT 1`
    )
    if (data && data[0] && data[0].version !== version) {
      if (import.meta.env.DEV) console.log(`entrou no reset: ${version}`)
      resetSQLiteDB(db)
      createDB(db)
      seedDB(db, version)
    }
  }
}

const init = async () => {
  const SQL = await initSqlJs({
    locateFile: (file: string) => '/assets/' + file,
  })
  const sqlFS = new SQLiteFS(SQL.FS, new IndexedDBBackend())
  SQL.register_for_idb(sqlFS)

  SQL.FS.mkdir('/sql')
  SQL.FS.mount(sqlFS, {}, '/sql')

  const path = '/sql/db.sqlite'
  if (typeof SharedArrayBuffer === 'undefined') {
    const stream = SQL.FS.open(path, 'a+')
    await stream.node.contents.readIfFallback()
    SQL.FS.close(stream)
  }

  db = new SQL.Database(path, { filename: true })
  // You might want to try `PRAGMA page_size=8192;` too!
  exec(db, `PRAGMA journal_mode=MEMORY;`)

  channel.addEventListener('message', (evt) => {
    const { data } = evt
    const res = exec(db, data)
    channel.postMessage(JSON.stringify(res))
  })

  channel.postMessage(JSON.stringify({ status: true }))
  createDB(db)
}

init()
