import type { ConsoleMessage, Page, Request, Response } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export interface NetworkEntry {
  timestamp: string;
  method: string;
  url: string;
  status: number;
  statusText: string;
  resourceType: string;
  duration?: number;
}

export interface ConsoleEntry {
  timestamp: string;
  type: string;
  text: string;
  location?: string;
}

export interface PageError {
  timestamp: string;
  message: string;
  stack?: string;
}

export interface DiagnosticReport {
  timestamp: string;
  summary: {
    totalRequests: number;
    failedRequests: number;
    count401: number;
    count403: number;
    count5xx: number;
    consoleErrors: number;
    consoleWarnings: number;
    pageErrors: number;
  };
  failedRequests: NetworkEntry[];
  all401s: NetworkEntry[];
  all403s: NetworkEntry[];
  all5xx: NetworkEntry[];
  consoleErrors: ConsoleEntry[];
  consoleWarnings: ConsoleEntry[];
  pageErrors: PageError[];
  allRequests: NetworkEntry[];
}

export class NetworkLogger {
  private allRequests: NetworkEntry[] = [];
  private consoleMessages: ConsoleEntry[] = [];
  private pageErrors: PageError[] = [];
  private requestTimestamps = new Map<string, number>();

  attachToPage(page: Page): void {
    page.on('request', (request: Request) => {
      this.requestTimestamps.set(request.url() + request.method(), Date.now());
    });

    page.on('response', (response: Response) => {
      const request = response.request();
      const key = request.url() + request.method();
      const startTime = this.requestTimestamps.get(key);
      const duration = startTime ? Date.now() - startTime : undefined;

      this.allRequests.push({
        timestamp: new Date().toISOString(),
        method: request.method(),
        url: request.url(),
        status: response.status(),
        statusText: response.statusText(),
        resourceType: request.resourceType(),
        duration,
      });
    });

    page.on('console', (msg: ConsoleMessage) => {
      this.consoleMessages.push({
        timestamp: new Date().toISOString(),
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
          ? `${msg.location().url}:${msg.location().lineNumber}`
          : undefined,
      });
    });

    page.on('pageerror', (error: Error) => {
      this.pageErrors.push({
        timestamp: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
      });
    });
  }

  generateReport(): DiagnosticReport {
    const failedRequests = this.allRequests.filter(
      (r) => r.status >= 400 && r.resourceType !== 'image',
    );
    const all401s = this.allRequests.filter((r) => r.status === 401);
    const all403s = this.allRequests.filter((r) => r.status === 403);
    const all5xx = this.allRequests.filter((r) => r.status >= 500);
    const consoleErrors = this.consoleMessages.filter((m) => m.type === 'error');
    const consoleWarnings = this.consoleMessages.filter((m) => m.type === 'warning');

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalRequests: this.allRequests.length,
        failedRequests: failedRequests.length,
        count401: all401s.length,
        count403: all403s.length,
        count5xx: all5xx.length,
        consoleErrors: consoleErrors.length,
        consoleWarnings: consoleWarnings.length,
        pageErrors: this.pageErrors.length,
      },
      failedRequests,
      all401s,
      all403s,
      all5xx,
      consoleErrors,
      consoleWarnings,
      pageErrors: this.pageErrors,
      allRequests: this.allRequests,
    };
  }

  saveReport(outputDir: string, baseName: string): void {
    fs.mkdirSync(outputDir, { recursive: true });
    const report = this.generateReport();

    // JSON report
    fs.writeFileSync(
      path.join(outputDir, `${baseName}.json`),
      JSON.stringify(report, null, 2),
    );

    // Human-readable markdown report
    const lines: string[] = [
      '# Login Flow Diagnostic Report',
      '',
      `**Generated:** ${report.timestamp}`,
      '',
      '## Summary',
      '',
      `| Metric | Count |`,
      `|--------|-------|`,
      `| Total Requests | ${report.summary.totalRequests} |`,
      `| Failed Requests (4xx/5xx) | ${report.summary.failedRequests} |`,
      `| 401 Unauthorized | ${report.summary.count401} |`,
      `| 403 Forbidden | ${report.summary.count403} |`,
      `| 5xx Server Errors | ${report.summary.count5xx} |`,
      `| Console Errors | ${report.summary.consoleErrors} |`,
      `| Console Warnings | ${report.summary.consoleWarnings} |`,
      `| Uncaught JS Errors | ${report.summary.pageErrors} |`,
      '',
    ];

    if (report.all401s.length > 0) {
      lines.push('## 401 Unauthorized Responses', '');
      for (const r of report.all401s) {
        lines.push(`- \`${r.method} ${r.url}\` (${r.duration ?? '?'}ms)`);
      }
      lines.push('');
    }

    if (report.all403s.length > 0) {
      lines.push('## 403 Forbidden Responses', '');
      for (const r of report.all403s) {
        lines.push(`- \`${r.method} ${r.url}\` (${r.duration ?? '?'}ms)`);
      }
      lines.push('');
    }

    if (report.all5xx.length > 0) {
      lines.push('## 5xx Server Errors', '');
      for (const r of report.all5xx) {
        lines.push(
          `- \`${r.method} ${r.url}\` -> ${r.status} ${r.statusText} (${r.duration ?? '?'}ms)`,
        );
      }
      lines.push('');
    }

    if (report.failedRequests.length > 0) {
      lines.push('## All Failed Requests', '');
      for (const r of report.failedRequests) {
        lines.push(
          `- \`${r.method} ${r.url}\` -> ${r.status} ${r.statusText}`,
        );
      }
      lines.push('');
    }

    if (report.consoleErrors.length > 0) {
      lines.push('## Console Errors', '');
      for (const e of report.consoleErrors) {
        lines.push(`- ${e.text}`);
        if (e.location) lines.push(`  Source: ${e.location}`);
      }
      lines.push('');
    }

    if (report.consoleWarnings.length > 0) {
      lines.push('## Console Warnings', '');
      for (const w of report.consoleWarnings) {
        lines.push(`- ${w.text}`);
      }
      lines.push('');
    }

    if (report.pageErrors.length > 0) {
      lines.push('## Uncaught JS Errors', '');
      for (const e of report.pageErrors) {
        lines.push(`- ${e.message}`);
        if (e.stack) lines.push(`  \`\`\`\n  ${e.stack}\n  \`\`\``);
      }
      lines.push('');
    }

    lines.push('## All Requests (chronological)', '');
    lines.push('| Time | Method | URL | Status | Duration |');
    lines.push('|------|--------|-----|--------|----------|');
    for (const r of report.allRequests) {
      const time = r.timestamp.split('T')[1]?.split('.')[0] ?? '';
      const shortUrl =
        r.url.length > 80 ? r.url.substring(0, 77) + '...' : r.url;
      const flag = r.status >= 400 ? ' **FAIL**' : '';
      lines.push(
        `| ${time} | ${r.method} | ${shortUrl} | ${r.status}${flag} | ${r.duration ?? '?'}ms |`,
      );
    }

    fs.writeFileSync(path.join(outputDir, `${baseName}.md`), lines.join('\n'));
  }
}
