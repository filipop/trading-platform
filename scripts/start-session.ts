#!/usr/bin/env ts-node
/**
 * Start Development Session with Auto-Trigger
 * Automatically creates PR at 90% of session time
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';

const execAsync = promisify(exec);

interface SessionConfig {
  durationMinutes: number;
  startTime: number;
  triggerAt: number;
  description: string;
}

class DevelopmentSession {
  private config: SessionConfig;
  private checkInterval: NodeJS.Timeout | null = null;
  private triggered: boolean = false;
  private stateFile: string;

  constructor(durationMinutes: number) {
    const now = Date.now();
    const durationMs = durationMinutes * 60 * 1000;
    const triggerAt = now + (durationMs * 0.9); // 90% threshold

    this.config = {
      durationMinutes,
      startTime: now,
      triggerAt,
      description: 'Trading platform development session'
    };

    this.stateFile = path.join(process.cwd(), '.session-state.json');
  }

  async start(): Promise<void> {
    console.log(chalk.bold.cyan('\n🚀 Starting Development Session\n'));
    console.log('═══════════════════════════════════════\n');

    await this.saveState();
    this.displaySessionInfo();
    this.startMonitoring();
    this.setupSignalHandlers();

    console.log('\n💡 Session started! Start coding...\n');
    console.log('═══════════════════════════════════════\n');
  }

  private displaySessionInfo(): void {
    const endTime = new Date(this.config.startTime + this.config.durationMinutes * 60 * 1000);
    const triggerTime = new Date(this.config.triggerAt);

    console.log(chalk.white('📊 Session Configuration:'));
    console.log(`   Duration: ${this.config.durationMinutes} minutes`);
    console.log(`   Started: ${new Date(this.config.startTime).toLocaleTimeString()}`);
    console.log(`   Will end: ${endTime.toLocaleTimeString()}`);
    console.log(`   PR trigger at: ${triggerTime.toLocaleTimeString()} (90%)`);
  }

  private startMonitoring(): void {
    // Check every minute
    this.checkInterval = setInterval(() => {
      this.checkProgress();
    }, 60 * 1000);

    // Also check every 10 seconds near the end
    setTimeout(() => {
      const fastCheck = setInterval(() => {
        this.checkProgress();
      }, 10 * 1000);

      // Stop fast checking after session ends
      setTimeout(() => {
        clearInterval(fastCheck);
      }, (this.config.durationMinutes - Math.floor(this.config.durationMinutes * 0.85)) * 60 * 1000);

    }, Math.floor(this.config.durationMinutes * 0.85) * 60 * 1000);
  }

  private async checkProgress(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.config.startTime;
    const total = this.config.durationMinutes * 60 * 1000;
    const percentage = (elapsed / total) * 100;
    const remaining = Math.max(0, Math.floor((total - elapsed) / 1000 / 60));

    // Update state
    await this.updateState();

    // Display progress
    const bar = this.createProgressBar(percentage);
    console.log(`\r⏱️  Progress: ${bar} ${percentage.toFixed(1)}% | ${remaining}min remaining   `);

    // Trigger at 90%
    if (percentage >= 90 && !this.triggered) {
      this.triggered = true;
      await this.triggerAutoWorkflow();
    }

    // End session at 100%
    if (percentage >= 100) {
      await this.endSession();
    }
  }

  private createProgressBar(percentage: number): string {
    const width = 20;
    const filled = Math.floor((percentage / 100) * width);
    const empty = width - filled;

    let bar = chalk.green('█'.repeat(filled));

    if (percentage >= 90) {
      bar = chalk.yellow('█'.repeat(filled));
    }

    return `[${bar}${chalk.gray('░'.repeat(empty))}]`;
  }

  private async triggerAutoWorkflow(): Promise<void> {
    console.log(chalk.bold.yellow('\n\n🎯 90% Threshold Reached!'));
    console.log('═══════════════════════════════════════\n');
    console.log('🚀 Automatically triggering PR workflow...\n');

    try {
      // Run the trigger-pr script
      const { stdout, stderr } = await execAsync('npm run trigger-pr');
      console.log(stdout);

      if (stderr && !stderr.includes('npm WARN')) {
        console.error(stderr);
      }

      console.log(chalk.green('\n✅ Auto-PR workflow triggered successfully!\n'));
      console.log('📋 Next Steps:');
      console.log('   1. GitHub Actions are running security checks');
      console.log('   2. Auto-fixes will be applied automatically');
      console.log('   3. Continue working or end session\n');
      console.log('═══════════════════════════════════════\n');

    } catch (error: any) {
      console.error(chalk.red('\n❌ Failed to trigger PR workflow:'));
      console.error(error.message);
      console.log(chalk.yellow('\n💡 You can manually trigger with: npm run trigger-pr\n'));
    }
  }

  private async saveState(): Promise<void> {
    const state = {
      startTime: this.config.startTime,
      lastActivity: Date.now(),
      description: this.config.description,
      durationMinutes: this.config.durationMinutes,
      triggerAt: this.config.triggerAt
    };

    await fs.writeFile(this.stateFile, JSON.stringify(state, null, 2));
  }

  private async updateState(): Promise<void> {
    try {
      const data = await fs.readFile(this.stateFile, 'utf-8');
      const state = JSON.parse(data);
      state.lastActivity = Date.now();
      await fs.writeFile(this.stateFile, JSON.stringify(state, null, 2));
    } catch (error) {
      // State file doesn't exist, create it
      await this.saveState();
    }
  }

  private async endSession(): Promise<void> {
    console.log(chalk.bold.cyan('\n\n⏰ Session Time Complete!\n'));
    console.log('═══════════════════════════════════════\n');

    const elapsed = Math.floor((Date.now() - this.config.startTime) / 1000 / 60);
    console.log(`📊 Session Summary:`);
    console.log(`   Duration: ${elapsed} minutes`);
    console.log(`   Started: ${new Date(this.config.startTime).toLocaleString()}`);
    console.log(`   Ended: ${new Date().toLocaleString()}`);

    if (this.triggered) {
      console.log(`   PR Created: ✅`);
    } else {
      console.log(`   PR Created: ❌ (not triggered)`);
    }

    console.log('\n💡 Options:');
    console.log('   - Continue working on the same branch');
    console.log('   - Start a new session: npm run start-session <minutes>');
    console.log('   - Check PR status on GitHub\n');

    console.log('═══════════════════════════════════════\n');

    this.cleanup();
    process.exit(0);
  }

  private setupSignalHandlers(): void {
    process.on('SIGINT', async () => {
      console.log(chalk.yellow('\n\n⚠️  Session interrupted by user\n'));

      const elapsed = Math.floor((Date.now() - this.config.startTime) / 1000 / 60);
      console.log(`⏱️  Session ran for ${elapsed} minutes`);

      if (!this.triggered) {
        console.log(chalk.yellow('⚠️  90% threshold not reached. You may want to:'));
        console.log('   - Run: npm run trigger-pr (to create PR manually)');
        console.log('   - Run: npm run recover (to check for uncommitted work)');
      }

      console.log('');
      this.cleanup();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n⚠️  Session terminated\n');
      this.cleanup();
      process.exit(0);
    });
  }

  private cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const durationMinutes = parseInt(args[0]) || 120; // Default 2 hours

if (isNaN(durationMinutes) || durationMinutes <= 0) {
  console.error('❌ Invalid duration. Usage: npm run start-session <minutes>');
  console.error('   Example: npm run start-session 120');
  process.exit(1);
}

if (durationMinutes > 300) {
  console.log(chalk.yellow('⚠️  Warning: Sessions longer than 5 hours may exceed token limits'));
}

// Start the session
const session = new DevelopmentSession(durationMinutes);
session.start();
