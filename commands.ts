import create from "./commands/sandbox/create.ts";
import exec from "./commands/sandbox/exec.ts";
import logs from "./commands/sandbox/logs.ts";
import providerGet from "./commands/sandbox/provider/get.ts";
import providerReset from "./commands/sandbox/provider/reset.ts";
import providerSelect from "./commands/sandbox/provider/select.ts";
import providerSet from "./commands/sandbox/provider/set.ts";
import remove from "./commands/sandbox/remove.ts";
import status from "./commands/sandbox/status.ts";
import stop from "./commands/sandbox/stop.ts";

export default [
  create,
  exec,
  stop,
  logs,
  remove,
  status,
  providerGet,
  providerSet,
  providerSelect,
  providerReset,
];
