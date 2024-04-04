#!/usr/bin/env node

import { homedir } from 'os';
import path from 'path';

import inquirer from 'inquirer';

import Kimi from '../lib/kimi.js';
import { loadConfig, saveConfig } from '../lib/config.js';

const KIMI_RC_PATH = path.join(homedir(), '.moonshot_ai_rc');

const config = await loadConfig(KIMI_RC_PATH);

async function question(prompt) {
  const answers = await inquirer.prompt([
    {
      name: 'question',
      ...prompt
    }
  ]);
  return answers.question.trim();
}

if (!config.api_key) {
  const apikey = await question({
    message: 'Please input your KIMI api key(you can visit https://platform.moonshot.cn/console/api-keys to get api key):'
  });
  config.api_key = apikey.trim();
  await saveConfig(config, KIMI_RC_PATH);
}

const kimi = new Kimi({apiKey: config.api_key});

const [command, ...args] = process.argv.slice(2);

if (!command) {
  const result = await kimi.files();
  console.log(`| ${'id'.padEnd(20, ' ')} | ${'filename'.padEnd(30, ' ')} | ${'purpose'.padEnd(12, ' ')} | ${'type'.padEnd(4, ' ')} | ${'size'.padEnd(10, ' ')} | ${'created_at'.padEnd(19, ' ')} | ${'status'} |`);
  console.log(`| ${'-'.repeat(20)} | ${'-'.repeat(30)} | ${'-'.repeat(12)} | ${'-'.repeat(4)} | ${'-'.repeat(10)} | ${'-'.repeat(19)} | ${'-'.repeat(6)} |`);
  for (const file of result.data) {
    const date = new Date();
    date.setTime(file.created_at * 1000);
    const createdAt = date.toISOString().slice(0, 19).replace('T', ' ');
    const size = ('' + file.bytes).padEnd(10, ' ');
    console.log(`| ${file.id} | ${file.filename.padEnd(30, ' ')} | ${file.purpose} | ${file.object} | ${size} | ${createdAt} | ${file.status.padEnd(6, ' ')} |`);
  }
} else if (command === 'rm') {
  const [fileId] = args;
  try {
    const result = await kimi.deleteFile(fileId);
    console.log(result);
    if (result.deleted) {
      console.log(`The file(${fileId}) is deleted now.`);
    }
  } catch (ex) {
    console.log(`Delete file(${fileId}) failed. because: ${ex.message}`);
  }
} else if (command === 'get') {
  const [fileId] = args;
  const result = await kimi.getFileContent(fileId);
  console.log(result);
} else if (command === 'upload') {
  const [filePath] = args;
  const result = await kimi.putFile(filePath, 'file-extract');
  console.log(result);
}
