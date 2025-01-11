import initSqlJs from '@jlongster/sql.js';
import { SQLiteFS } from 'absurd-sql';
import IndexedDBBackend from 'absurd-sql/dist/indexeddb-backend';

async function init() {
  const SQL = await initSqlJs({ locateFile: (file: string) => '/assets/' + file });
  const sqlFS = new SQLiteFS(SQL.FS, new IndexedDBBackend());
  SQL.register_for_idb(sqlFS);

  SQL.FS.mkdir('/sql');
  SQL.FS.mount(sqlFS, {}, '/sql');

  const path = '/sql/db.sqlite';
  if (typeof SharedArrayBuffer === 'undefined') {
    const stream = SQL.FS.open(path, 'a+');
    await stream.node.contents.readIfFallback();
    SQL.FS.close(stream);
  }

  const db = new SQL.Database(path, { filename: true });
  // You might want to try `PRAGMA page_size=8192;` too!
  db.exec(`
    PRAGMA journal_mode=MEMORY;
  `);
}

init()