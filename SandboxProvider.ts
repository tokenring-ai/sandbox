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
  createContainer(options?: SandboxOptions): Promise<SandboxResult>;

  executeCommand(containerId: string, command: string): Promise<ExecuteResult>;

  stopContainer(containerId: string): Promise<void>;

  getLogs(containerId: string): Promise<LogsResult>;

  removeContainer(containerId: string): Promise<void>;
}