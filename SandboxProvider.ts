import type {MaybePromise} from "bun";

export interface SandboxOptions {
  label?: string;
  image?: string;
  workingDir?: string;
  environment?: Record<string, string>;
  timeout?: number;
}

export interface SandboxResult {
  containerId: string;
  status: string;
}

export interface ExecuteResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface LogsResult {
  logs: string;
}

export interface SandboxProvider {
  createContainer(options?: SandboxOptions): MaybePromise<SandboxResult>;

  executeCommand(containerId: string, command: string): MaybePromise<ExecuteResult>;

  stopContainer(containerId: string): MaybePromise<void>;

  getLogs(containerId: string): MaybePromise<LogsResult>;

  removeContainer(containerId: string): MaybePromise<void>;
}
