import { access, readFile, writeFile, constants } from 'fs/promises';

import ini from 'ini';

export async function loadConfig(rcPath) {
  let content = '';
  try {
    await access(rcPath, constants.F_OK | constants.R_OK | constants.W_OK);
    content = await readFile(rcPath, 'utf8');
  } catch (ex) {
    // ignore when file not exits
  }
  return ini.parse(content);
}

export async function saveConfig(config, rcPath) {
  await writeFile(rcPath, ini.stringify(config));
}
