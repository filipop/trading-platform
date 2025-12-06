#!/usr/bin/env ts-node
/**
 * Session Recovery Script
 * Run this after an interrupted session
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as readline from 'readline';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

interface SessionState {
  startTime: number;
  lastActivity: number;
  description: string;
  branch?: string;
}

class SessionRecovery {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async run(): Promise<void> {
    console.log('\n🔍 Session Recovery Tool\n');
    console.log('═══════════════════════════════════════\n');

    try {
      await this.checkUncommittedChanges();
      await this.checkUnpushedBranches();
      await this.checkSessionState();
      await this.checkStashedWork();

      console.log('\n═══════════════════════════════════════');
      console.log('✅ Recovery check complete!\n');

    } catch (error: any) {
      console.error('\n❌ Recovery failed:', error.message);
    } finally {
      this.rl.close();
    }
  }

  private async checkUncommittedChanges(): Promise<void> {
    console.log('📝 Checking for uncommitted changes...');

    const { stdout: status } = await execAsync('git status --porcelain');

    if (status.trim()) {
      console.log('   ⚠️  Found uncommitted changes:\n');
      const { stdout: statusLong } = await execAsync('git status -s');
      console.log(statusLong);

      const answer = await this.ask('\n   💾 Commit these changes? (y/n): ');

      if (answer.toLowerCase() === 'y') {
        await this.createRecoveryCommit();
      } else {
        const stash = await this.ask('   📦 Stash them instead? (y/n): ');
        if (stash.toLowerCase() === 'y') {
          await execAsync('git stash save "Recovery stash - ' + new Date().toISOString() + '"');
          console.log('   ✅ Changes stashed');
        }
      }
    } else {
      console.log('   ✅ No uncommitted changes\n');
    }
  }

  private async checkUnpushedBranches(): Promise<void> {
    console.log('🌿 Checking for unpushed work...');

    try {
      // Get current branch
      const { stdout: currentBranch } = await execAsync('git branch --show-current');
      const branch = currentBranch.trim();

      // Check if there are unpushed commits
      const { stdout: unpushed } = await execAsync(
        `git log origin/${branch}..HEAD --oneline 2>/dev/null || echo ""`
      );

      if (unpushed.trim()) {
        console.log(`   ⚠️  Found unpushed commits on '${branch}':\n`);
        console.log(unpushed);

        const answer = await this.ask('\n   📤 Push these commits? (y/n): ');

        if (answer.toLowerCase() === 'y') {
          await execAsync(`git push -u origin ${branch}`);
          console.log('   ✅ Commits pushed');

          const createPR = await this.ask('   🔀 Create Pull Request? (y/n): ');
          if (createPR.toLowerCase() === 'y') {
            await this.createRecoveryPR();
          }
        }
      } else {
        console.log('   ✅ No unpushed commits\n');
      }
    } catch (error) {
      console.log('   ℹ️  Could not check for unpushed commits (branch may not have upstream)\n');
    }
  }

  private async checkSessionState(): Promise<void> {
    console.log('💾 Checking for previous session state...');

    const stateFile = path.join(process.cwd(), '.session-state.json');

    try {
      const data = await fs.readFile(stateFile, 'utf-8');
      const state: SessionState = JSON.parse(data);

      const started = new Date(state.startTime);
      const lastActivity = new Date(state.lastActivity);
      const duration = Math.floor((lastActivity.getTime() - started.getTime()) / 1000 / 60);

      console.log('   📊 Found previous session:');
      console.log(`      Started: ${started.toLocaleString()}`);
      console.log(`      Last activity: ${lastActivity.toLocaleString()}`);
      console.log(`      Duration: ${duration} minutes`);
      console.log(`      Description: ${state.description}`);
      if (state.branch) {
        console.log(`      Branch: ${state.branch}`);
      }

      const answer = await this.ask('\n   🔄 Start new session? (y/n): ');

      if (answer.toLowerCase() === 'y') {
        await this.startNewSession();
      } else {
        console.log('   ✅ Keeping previous session state');
      }

    } catch (error) {
      console.log('   ℹ️  No previous session state found');
      const create = await this.ask('   📝 Create new session? (y/n): ');
      if (create.toLowerCase() === 'y') {
        await this.startNewSession();
      }
    }

    console.log('');
  }

  private async checkStashedWork(): Promise<void> {
    console.log('📦 Checking for stashed work...');

    const { stdout: stashList } = await execAsync('git stash list');

    if (stashList.trim()) {
      console.log('   ⚠️  Found stashed work:\n');
      console.log(stashList);

      const answer = await this.ask('\n   🔓 Apply latest stash? (y/n): ');

      if (answer.toLowerCase() === 'y') {
        try {
          await execAsync('git stash pop');
          console.log('   ✅ Stash applied');
        } catch (error) {
          console.log('   ⚠️  Stash pop failed (merge conflicts?). Use "git stash apply" manually.');
        }
      }
    } else {
      console.log('   ✅ No stashed work\n');
    }
  }

  private async createRecoveryCommit(): Promise<void> {
    const timestamp = new Date().toISOString();
    const message = `chore: Recovery commit from interrupted session

Session interrupted at: ${timestamp}
Auto-recovery commit to preserve work.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>`;

    await execAsync('git add .');
    await execAsync(`git commit -m "${message}"`);

    console.log('   ✅ Recovery commit created\n');
  }

  private async createRecoveryPR(): Promise<void> {
    console.log('\n   🚀 Creating Pull Request...');

    try {
      // Use the trigger-pr script
      await execAsync('npm run trigger-pr');
    } catch (error) {
      console.log('   ⚠️  Could not auto-create PR. Create manually or run: npm run trigger-pr');
    }
  }

  private async startNewSession(): Promise<void> {
    const { stdout: currentBranch } = await execAsync('git branch --show-current');

    const state: SessionState = {
      startTime: Date.now(),
      lastActivity: Date.now(),
      description: 'Trading platform development session',
      branch: currentBranch.trim()
    };

    const stateFile = path.join(process.cwd(), '.session-state.json');
    await fs.writeFile(stateFile, JSON.stringify(state, null, 2));

    console.log('   ✅ New session state created');
  }

  private ask(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }
}

// Run recovery
const recovery = new SessionRecovery();
recovery.run();
