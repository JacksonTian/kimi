#!/usr/bin/env node

import { homedir } from 'os';
import path from 'path';

import { readAsSSE } from 'httpx';
import readline from 'readline/promises';
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

const messages = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.pause();

if (!config.api_key) {
  const apikey = await question({
    message: 'Please input your kimi api key(you can visit https://platform.moonshot.cn/console/api-keys to get api key):'
  });
  config.api_key = apikey.trim();
  await saveConfig(config, KIMI_RC_PATH);
}

const kimi = new Kimi({apiKey: config.api_key});

if (!config.model) {
  const models = await kimi.models();
  const model = await question({
    type: 'list',
    message: 'Please select your model:',
    choices: models.data.map((d) => {
      return d.id;
    }),
    default: config.model
  });
  if (model) {
    config.model = model;
  }
  await saveConfig(config, KIMI_RC_PATH);
}

// eslint-disable-next-line no-constant-condition
while (true) {
  const answer = await rl.question('What is your query: ');
  messages.push({'role': 'user', 'content': answer});
  const response = await kimi.chat(messages, {
    model: config.model
  });
  let lastEvent;
  let message = '';
  for await (const event of readAsSSE(response)) {
    if (event.data !== '[DONE]') {
      const data = JSON.parse(event.data);
      const choice = data.choices[0];
      if (choice.finish_reason === 'content_filter') {
        console.log(event);
      } else if (choice.finish_reason === 'stop') {
        lastEvent = event;
      } else if (!choice.finish_reason) {
        const content = choice.delta.content;
        if (content) {
          process.stdout.write(content);
          message += content;
        }
      }
    } else {
      console.log();
    }
  }

  messages.push({
    role: 'assistant',
    content: message
  });

  const data = JSON.parse(lastEvent.data);
  const choice = data.choices[0];
  console.log(`[Verbose] request id: ${data.id}, usage tokens: ${choice.usage.total_tokens}`);
}
