#!/usr/bin/env ts-node
/**
 * File Change Watcher
 * Automatically triggers PR after a threshold of file changes
 */

import { watch, FSWatcher } from 'chokidar';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

interface ChangeStats {
  totalChanges: number;
  fileChanges: Map<string, number>;
  startTime: number;
  lastChange: number;
}

class FileChangeWatcher {
  private watcher: FSWatcher | null = null;
  private stats: ChangeStats;
  private threshold: number;
  private triggered: boolean = false;

  constructor(threshold: number = 50) {
    this.threshold = threshold;
    this.stats = {
      totalChanges: 0,
      fileChanges: new Map(),
      startTime: Date.now(),
      lastChange: Date.now()
    };
  }

  start(): void {
    console.log('\n👀 File Change Watcher Started\n');
    console.log('═══════════════════════════════════════\n');
    console.log(`📊 Configuration:`);
    console.log(`   Threshold: ${this.threshold} changes`);
    console.log(`   Watching: backend/src, frontend/src`);
    console.log(`   Auto-trigger at: ${this.threshold} changes\n`);
    console.log('═══════════════════════════════════════\n');

    // Watch patterns
    const patterns = [
      'backend/src/**/*.{ts,js,json}',
      'frontend/src/**/*.{ts,tsx,js,jsx,css,scss}'
    ];

    this.watcher = watch(patterns, {
      ignored: [
        /(^|[\/\\])\../, // Ignore dotfiles
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/*.test.{ts,tsx,js,jsx}',
        '**/*.spec.{ts,tsx,js,jsx}'
      ],
      persistent: true,
      ignoreInitial: true
    });

    this.watcher.on('change', (filepath) => this.handleChange(filepath, 'modified'));
    this.watcher.on('add', (filepath) => this.handleChange(filepath, 'added'));
    this.watcher.on('unlink', (filepath) => this.handleChange(filepath, 'deleted'));

    this.watcher.on('error', (error) => {
      console.error('❌ Watcher error:', error);
    });

    // Display stats periodically
    setInterval(() => {
      this.displayStats();
    }, 30000); // Every 30 seconds

    this.setupSignalHandlers();
  }

  private handleChange(filepath: string, changeType: string): void {
    this.stats.totalChanges++;
    this.stats.lastChange = Date.now();

    const relativePath = path.relative(process.cwd(), filepath);
    const currentCount = this.stats.fileChanges.get(relativePath) || 0;
    this.stats.fileChanges.set(relativePath, currentCount + 1);

    const percentage = (this.stats.totalChanges / this.threshold) * 100;
    const emoji = changeType === 'added' ? '➕' : changeType === 'deleted' ? '➖' : '✏️';

    console.log(`${emoji} [${this.stats.totalChanges}/${this.threshold}] ${relativePath} (${changeType})`);

    // Check threshold
    if (this.stats.totalChanges >= this.threshold && !this.triggered) {
      this.triggerWorkflow();
    } else if (percentage >= 80 && percentage < 90 && !this.triggered) {
      console.log(`\n⚠️  Warning: ${percentage.toFixed(0)}% of change threshold reached\n`);
    }
  }

  private async triggerWorkflow(): Promise<void> {
    this.triggered = true;

    console.log('\n\n🎯 Change Threshold Reached!');
    console.log('═══════════════════════════════════════\n');
    console.log(`📊 Total changes: ${this.stats.totalChanges}`);
    console.log(`📁 Files modified: ${this.stats.fileChanges.size}`);
    console.log('\n🚀 Triggering Auto-PR workflow...\n');

    try {
      const { stdout, stderr } = await execAsync('npm run trigger-pr');
      console.log(stdout);

      if (stderr && !stderr.includes('npm WARN')) {
        console.error(stderr);
      }

      console.log('═══════════════════════════════════════\n');
      console.log('✅ Auto-PR workflow triggered!\n');
      console.log('💡 Watcher will continue monitoring...\n');

      // Reset counter for next cycle
      this.stats.totalChanges = 0;
      this.stats.fileChanges.clear();
      this.triggered = false;

    } catch (error: any) {
      console.error('\n❌ Failed to trigger PR workflow:');
      console.error(error.message);
      console.log('\n💡 You can manually trigger: npm run trigger-pr\n');
      this.triggered = false;
    }
  }

  private displayStats(): void {
    if (this.stats.totalChanges === 0) return;

    const elapsed = Math.floor((Date.now() - this.stats.startTime) / 1000 / 60);
    const percentage = (this.stats.totalChanges / this.threshold) * 100;

    console.log('\n───────────────────────────────────────');
    console.log(`📊 Session Stats (${elapsed}min):`);
    console.log(`   Changes: ${this.stats.totalChanges}/${this.threshold} (${percentage.toFixed(1)}%)`);
    console.log(`   Files: ${this.stats.fileChanges.size}`);
    console.log(`   Last change: ${Math.floor((Date.now() - this.stats.lastChange) / 1000)}s ago`);
    console.log('───────────────────────────────────────\n');

    // Show most changed files
    if (this.stats.fileChanges.size > 0) {
      const sorted = Array.from(this.stats.fileChanges.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      console.log('🔥 Most changed files:');
      sorted.forEach(([file, count]) => {
        console.log(`   ${count}x ${file}`);
      });
      console.log('');
    }
  }

  private setupSignalHandlers(): void {
    process.on('SIGINT', () => {
      console.log('\n\n⚠️  Watcher stopped by user\n');
      this.displayFinalStats();
      this.cleanup();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      console.log('\n⚠️  Watcher terminated\n');
      this.cleanup();
      process.exit(0);
    });
  }

  private displayFinalStats(): void {
    const elapsed = Math.floor((Date.now() - this.stats.startTime) / 1000 / 60);

    console.log('═══════════════════════════════════════');
    console.log('📊 Final Session Stats:\n');
    console.log(`   Duration: ${elapsed} minutes`);
    console.log(`   Total changes: ${this.stats.totalChanges}`);
    console.log(`   Files modified: ${this.stats.fileChanges.size}`);
    console.log(`   PR triggered: ${this.triggered ? 'Yes' : 'No'}`);

    if (!this.triggered && this.stats.totalChanges > 0) {
      const remaining = this.threshold - this.stats.totalChanges;
      console.log(`\n💡 ${remaining} more changes needed to trigger PR`);
      console.log(`   Run manually: npm run trigger-pr`);
    }

    console.log('═══════════════════════════════════════\n');
  }

  private cleanup(): void {
    if (this.watcher) {
      this.watcher.close();
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const threshold = parseInt(args[0]) || 50;

if (isNaN(threshold) || threshold <= 0) {
  console.error('❌ Invalid threshold. Usage: npm run watch-changes [threshold]');
  console.error('   Example: npm run watch-changes 50');
  process.exit(1);
}

// Start watching
const watcher = new FileChangeWatcher(threshold);
watcher.start();
