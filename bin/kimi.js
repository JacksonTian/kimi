#!/usr/bin/env node

import { homedir } from 'os';
import path from 'path';

import { readAsSSE } from 'httpx';
import readline from 'readline/promises';
import inquirer from 'inquirer';
import chalk from 'chalk';

import Kimi from '../lib/kimi.js';
import { loadConfig, saveConfig } from '../lib/config.js';
import { loadJSONSync, sleep } from 'kitx';
import { fileURLToPath } from 'url';
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

const completions = [
  '.help',
  '.exit',
  '.clear',
  '.set_model',
  '.add_file',
  '.set_verbose',
  '.set_api_key'
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer: (line) => {
    const hits = completions.filter((c) => c.startsWith(line));
    // Show all completions if none found
    return [hits.length ? hits : completions, line];
  }
});
rl.pause();

async function chooseAPIKey() {
  const apikey = await question({
    type: 'password',
    message: 'Please input your kimi api key(you can visit https://platform.moonshot.cn/console/api-keys to get api key):',
    mask: '*'
  });
  config.api_key = apikey.trim();
  await saveConfig(config, KIMI_RC_PATH);
}

if (!config.api_key) {
  await chooseAPIKey();
}

const kimi = new Kimi({apiKey: config.api_key});

async function chooseModel() {
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

if (!config.model) {
  await chooseModel();
}

function printHelp() {
  console.log('.set_model         choose model');
  console.log('.set_api_key       set api key');
  console.log('.clear             clean context');
  console.log('.exit              exit the program');
  console.log('.set_verbose       turn on/off verbose mode');
  console.log('.add_file          add a file into chat session');
  console.log('.help              show this help');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = loadJSONSync(path.join(__dirname, '../package.json'));
console.log(`Welcome to KIMI CLI(v${pkg.version}), type ${chalk.bgGray('.help')} for more information.`);
console.log(`Current model is ${chalk.bgGreen(config.model)}.`);

// eslint-disable-next-line no-constant-condition
while (true) {
  const answer = await rl.question('What is your query: ');
  rl.pause();
  process.stdout.clearLine();
  process.stdout.cursorTo(0);

  if (!answer) {
    console.log(chalk.yellow('[Warning] The query is empty, please type it again.'));
    continue;
  }

  if (answer === '.help') {
    printHelp();
    continue;
  }

  if (answer === '.exit') {
    console.log('Quiting KIMI CLI now. Bye!');
    process.exit(0);
  }

  if (answer === '.set_api_key') {
    const apikey = await question({
      type: 'password',
      message: 'Please input your new moonshot api key:',
      mask: '*'
    });

    config.api_key = apikey;
    await saveConfig(config, KIMI_RC_PATH);
    console.log('The new API key is set.');
    continue;
  }

  if (answer === '.set_verbose') {
    const verbose = await question({
      type: 'list',
      message: 'Turn on/off verbose:',
      choices: [
        'true',
        'false'
      ],
      default: config.verbose || false
    });

    config.verbose = verbose === 'true';
    await saveConfig(config, KIMI_RC_PATH);
    console.log(`The verbose mode is turned ${config.verbose ? 'on' : 'off'} now.`);
    continue;
  }

  if (answer === '.set_model') {
    await chooseModel();
    console.log(`The model is switched to ${chalk.bgGreen(config.model)} now.`);

    continue;
  }

  if (answer === '.clear') {
    messages.length = 0;
    console.log(`The context is cleared now. Current messages length: ${messages.length}`);
    continue;
  }

  if (answer === '.add_file') {
    const result = await kimi.files();
    const fileId = await question({
      type: 'list',
      message: 'Please select your file:',
      choices: result.data.map((d) => {
        return {
          name: d.filename,
          value: d.id
        };
      }),
    });
    const content = await kimi.getFileContent(fileId);
    messages.unshift({
      role: 'system',
      content: JSON.stringify(content)
    });
    console.log(`The file ${content.filename} is added into chat session.`);
    continue;
  }

  messages.push({'role': 'user', 'content': answer});
  let response;
  try {
    response = await kimi.chat(messages, {
      model: config.model
    });
  } catch (ex) {
    if (ex.type === 'rate_limit_reached_error' && ex.code === 429) {
      if (config.verbose) {
        console.log(chalk.gray('[Verbose] hit rate limit, try again after 3 second'));
      }

      await sleep(3000);
      response = await kimi.chat(messages, {
        model: config.model
      });
    } else {
      throw ex;
    }
  }

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

  if (config.verbose) {
    const data = JSON.parse(lastEvent.data);
    const choice = data.choices[0];
    const { prompt_tokens, completion_tokens, total_tokens } = choice.usage;
    console.log(chalk.gray(`[Verbose] request id: ${data.id}, used tokens: ${total_tokens}(${prompt_tokens}/${ completion_tokens })`));
  }
}
