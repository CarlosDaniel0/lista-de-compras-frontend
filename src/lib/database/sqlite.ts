import { initBackend } from 'absurd-sql/dist/indexeddb-main-thread';

export const initSQLite = () => {
  const worker = new Worker(new URL('./worker.ts', import.meta.url), {
    type: 'module'
  });
  console.log('teste')
  initBackend(worker);
}
