import { runExpiryCycle } from '../services/sweeper.service';
import {
  SWEEPER_ERRORS,
  SWEEPER_INTERVAL_MS,
} from '../constants/sweeper.constants';

let intervalId: NodeJS.Timeout | null = null;

export function startSweeper(): void {
  if (intervalId) {
    console.warn(`[Sweeper] ${SWEEPER_ERRORS.ALREADY_RUNNING}`);
    return;
  }

  intervalId = setInterval(async () => {
    try {
      await runExpiryCycle();
    } catch (err) {
      console.error('[Sweeper] Cycle error:', err);
    }
  }, SWEEPER_INTERVAL_MS);

  console.log(
    `[Sweeper] Started — running every ${SWEEPER_INTERVAL_MS / 1000}s`
  );
}

export function stopSweeper(): void {
  if (!intervalId) {
    console.warn(`[Sweeper] ${SWEEPER_ERRORS.NOT_RUNNING}`);
    return;
  }

  clearInterval(intervalId);
  intervalId = null;
  console.log('[Sweeper] Stopped.');
}
