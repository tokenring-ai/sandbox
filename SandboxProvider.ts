export interface SandboxOptions {
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

export default abstract class SandboxProvider {
  abstract createContainer(options?: SandboxOptions): Promise<SandboxResult>;
  abstract executeCommand(containerId: string, command: string): Promise<ExecuteResult>;
  abstract stopContainer(containerId: string): Promise<void>;
  abstract getLogs(containerId: string): Promise<LogsResult>;
  abstract removeContainer(containerId: string): Promise<void>;
}