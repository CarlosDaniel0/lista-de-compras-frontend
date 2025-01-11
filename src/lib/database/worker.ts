import initSqlJs from '@jlongster/sql.js';
import { SQLiteFS } from 'absurd-sql';
import IndexedDBBackend from 'absurd-sql/dist/indexeddb-backend';
const { API_URL } = import.meta.env
declare let self: ServiceWorkerGlobalScope

self.addEventListener('fetch', (evt) => {
  console.log(evt.request.url)
  if (evt.request.url.includes(API_URL)) {
    return evt.respondWith(Promise.reject(new  Error('Teste para bloquear todas as requisições')))
  }
  evt.respondWith(fetch(evt.request))
})

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
  console.log('DB Inited')
}

init()