import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import { AIConfig } from '../types';

const execAsync = promisify(exec);

export function isValidAIProvider(provider: string): provider is NonNullable<AIConfig['provider']> {
    return ['openrouter', 'openai', 'anthropic', 'custom'].includes(provider);
}

export async function runValidations(validations: string[], dry: boolean): Promise<void> {
  if (validations.length === 0) {
    return;
  }

  if (dry) {
    console.log(chalk.yellow('🔍 DRY RUN - Validations that would run:'));
    validations.forEach(cmd => console.log(chalk.cyan(`  ${cmd}`)));
    return;
  }

  console.log(chalk.blue(`🧪 Running ${validations.length} validation${validations.length > 1 ? 's' : ''}...`));
  
  for (let i = 0; i < validations.length; i++) {
    const validation = validations[i];
    console.log(chalk.blue(`🧪 Running validation [${i + 1}/${validations.length}]: ${validation}`));
    
    try {
      const { stdout, stderr } = await execAsync(validation);
      console.log(chalk.green(`✅ Validation passed: ${validation}`));
      
      // Show stdout if there's any output
      if (stdout && stdout.trim()) {
        console.log(chalk.gray(`   Output: ${stdout.trim()}`));
      }
      
    } catch (error: any) {
      console.error(chalk.red(`❌ Validation failed: ${validation}`));
      
      // Show error details
      if (error.stdout && error.stdout.trim()) {
        console.error(chalk.yellow(`   stdout: ${error.stdout.trim()}`));
      }
      if (error.stderr && error.stderr.trim()) {
        console.error(chalk.red(`   stderr: ${error.stderr.trim()}`));
      }
      if (error.message) {
        console.error(chalk.red(`   Error: ${error.message}`));
      }
      
      process.exit(1);
    }
  }
  
  console.log(chalk.green(`🎉 All ${validations.length} validation${validations.length > 1 ? 's' : ''} passed!`));
}