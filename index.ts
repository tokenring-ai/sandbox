import packageJSON from './package.json' with {type: 'json'};

export const name = packageJSON.name;
export const version = packageJSON.version;
export const description = packageJSON.description;

export {default as SandboxService} from "./SandboxService.ts";
export {default as SandboxResource} from "./SandboxProvider.ts";
export * as tools from "./tools.ts";
export * as chatCommands from "./chatCommands.ts";