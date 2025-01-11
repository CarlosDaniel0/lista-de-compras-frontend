/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite-plugin-pwa/info" />
/// <reference lib="webworker" />

declare module "absurd-sql";
declare module "absurd-sql/dist/*";

// import static, {} from "sql.js";
// import initSqlJs, { SqlJsStatic, Database } from "sql.js";
declare module "@jlongster/sql.js" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t: any;
  export default t;
}
