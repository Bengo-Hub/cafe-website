import { execSync, spawn, type ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/** Pod selector mapping for each service namespace. */
const SERVICE_PODS: Record<string, { namespace: string; labelSelector: string }> = {
  'notifications-api': { namespace: 'notifications', labelSelector: 'app=notifications-api' },
  'logistics-api': { namespace: 'logistics', labelSelector: 'app=logistics-api' },
  'treasury-api': { namespace: 'treasury', labelSelector: 'app=treasury-api' },
  'ordering-backend': { namespace: 'ordering', labelSelector: 'app=ordering-backend' },
  'inventory-api': { namespace: 'inventory', labelSelector: 'app=inventory-api' },
  'pos-api': { namespace: 'pos', labelSelector: 'app=pos-api' },
};

export class KubectlLogger {
  private processes: Map<string, ChildProcess> = new Map();
  private logBuffers: Map<string, string[]> = new Map();

  /**
   * Start tailing logs for specified services.
   * Captures logs from the moment this is called.
   */
  startTailing(services: string[] = Object.keys(SERVICE_PODS)): void {
    for (const svc of services) {
      const pod = SERVICE_PODS[svc];
      if (!pod) continue;

      this.logBuffers.set(svc, []);

      try {
        const proc = spawn('kubectl', [
          'logs', '-f', '--tail=0',
          '-n', pod.namespace,
          '-l', pod.labelSelector,
          '--timestamps=true',
        ], { stdio: ['ignore', 'pipe', 'pipe'] });

        proc.stdout?.on('data', (data: Buffer) => {
          const lines = data.toString().split('\n').filter(Boolean);
          this.logBuffers.get(svc)?.push(...lines);
        });

        proc.stderr?.on('data', (data: Buffer) => {
          const lines = data.toString().split('\n').filter(Boolean);
          this.logBuffers.get(svc)?.push(...lines.map((l) => `[stderr] ${l}`));
        });

        this.processes.set(svc, proc);
      } catch {
        console.warn(`Failed to start log tailing for ${svc}`);
      }
    }
  }

  /** Stop all log tailing processes. */
  stopAll(): void {
    for (const [, proc] of this.processes) {
      proc.kill('SIGTERM');
    }
    this.processes.clear();
  }

  /** Get captured logs for a specific service. */
  getLogs(service: string): string[] {
    return this.logBuffers.get(service) ?? [];
  }

  /** Search all captured logs for a pattern. Returns matching lines with service name. */
  searchLogs(pattern: string | RegExp): { service: string; line: string }[] {
    const results: { service: string; line: string }[] = [];
    const regex = typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern;

    for (const [svc, lines] of this.logBuffers) {
      for (const line of lines) {
        if (regex.test(line)) {
          results.push({ service: svc, line });
        }
      }
    }
    return results;
  }

  /** Get recent logs from a service (last N minutes). */
  static getRecentLogs(service: string, sinceMinutes = 5): string {
    const pod = SERVICE_PODS[service];
    if (!pod) return `Unknown service: ${service}`;

    try {
      return execSync(
        `kubectl logs -n ${pod.namespace} -l ${pod.labelSelector} --since=${sinceMinutes}m --timestamps=true 2>&1`,
        { timeout: 15_000, encoding: 'utf-8' },
      );
    } catch (err: any) {
      return `Error fetching logs: ${err.message}`;
    }
  }

  /** Save all captured logs to files. */
  saveReport(outputDir: string, baseName: string): void {
    fs.mkdirSync(outputDir, { recursive: true });

    for (const [svc, lines] of this.logBuffers) {
      if (lines.length === 0) continue;
      fs.writeFileSync(
        path.join(outputDir, `${baseName}-${svc}.log`),
        lines.join('\n'),
      );
    }

    // Summary report
    const summary: string[] = [
      `# Kubectl Log Report: ${baseName}`,
      `Generated: ${new Date().toISOString()}`,
      '',
    ];

    for (const [svc, lines] of this.logBuffers) {
      summary.push(`## ${svc} (${lines.length} lines)`);
      // Show last 20 lines
      const tail = lines.slice(-20);
      for (const line of tail) {
        summary.push(`  ${line}`);
      }
      summary.push('');
    }

    fs.writeFileSync(path.join(outputDir, `${baseName}-summary.md`), summary.join('\n'));
  }
}
