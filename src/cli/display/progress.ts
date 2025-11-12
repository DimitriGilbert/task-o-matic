import chalk from 'chalk';
import type { ProgressEvent } from '../../types/callbacks';

/**
 * Display progress events for the CLI
 * This function is used as a callback for services to report progress
 */
export function displayProgress(event: ProgressEvent): void {
  switch (event.type) {
    case 'started':
      console.log(chalk.blue('🤖 ' + event.message));
      break;

    case 'progress':
      if (event.current && event.total) {
        const percent = Math.round((event.current / event.total) * 100);
        console.log(
          chalk.cyan(
            `  [${event.current}/${event.total}] ${percent}% - ${event.message}`
          )
        );
      } else {
        console.log(chalk.cyan('  → ' + event.message));
      }
      break;

    case 'stream-chunk':
      process.stdout.write(event.text);
      break;

    case 'completed':
      console.log(chalk.green('✓ ' + event.message));
      break;

    case 'warning':
      console.log(chalk.yellow('⚠️  ' + event.message));
      break;

    case 'info':
      console.log(chalk.gray('  ℹ ' + event.message));
      break;
  }
}

/**
 * Display an error message
 */
export function displayError(error: Error | unknown): void {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(chalk.red('❌ Error:'), message);
}
