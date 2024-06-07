import { homedir } from 'os';
import { join } from 'path';
import process from 'process';

import { loadConfig } from './config.js';

const KIMI_RC_PATH = join(homedir(), '.moonshot_ai_rc');

export async function getAPIKey(rcPath = KIMI_RC_PATH) {
  if (process.env.MOONSHOT_API_KEY) {
    return process.env.MOONSHOT_API_KEY;
  }

  const config = await loadConfig(rcPath);
  if (config && config.api_key) {
    return config.api_key;
  }

  return '';
}
