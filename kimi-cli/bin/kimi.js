#!/usr/bin/env node

import { homedir } from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline/promises';
import process from 'process';

import { readAsSSE } from 'httpx';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { loadJSONSync, sleep } from 'kitx';

import Kimi from '@jacksontian/kimi';
import { loadConfig, saveConfig } from '../lib/config.js';
import { readFile } from 'fs/promises';
import { getMIME } from '../lib/mime.js';
import { isVisionModel } from '../lib/helper.js';

const KIMI_RC_PATH = path.join(homedir(), '.moonshot_ai_rc');
const rcPath = KIMI_RC_PATH;

const config = await loadConfig(rcPath);

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
  '.set_api_key',
  '.set_system',
  '.add_image'
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
  await saveConfig(config, rcPath);
}

if (!config.api_key) {
  await chooseAPIKey();
}

const kimi = new Kimi({apiKey: config.api_key});

function cost(model, tokens) {
  // set https://platform.moonshot.cn/docs/pricing/chat#%E8%AE%A1%E8%B4%B9%E5%9F%BA%E6%9C%AC%E6%A6%82%E5%BF%B5
  // moonshot-v1-8k   1M tokens ¥12.00
  // moonshot-v1-32k  1M tokens ¥24.00
  // moonshot-v1-128k 1M tokens ¥60.00
  // moonshot-v1-auto
  if (model === 'moonshot-v1-auto') {
    return [tokens / 1000000 * 12, tokens / 1000000 * 60];
  }

  if (model === 'kimi-latest') {
    return [tokens / 1000000 * 12, tokens / 1000000 * 60];
  }

  const map = {
    'moonshot-v1-8k': 12,
    'moonshot-v1-32k': 24,
    'moonshot-v1-128k': 60,
    'moonshot-v1-8k-vision-preview': 12,
    'moonshot-v1-32k-vision-preview': 24,
    'moonshot-v1-128k-vision-preview': 60,
  };

  if (!map[model]) {
    throw new Error(`Invalid model: ${model}`);
  }

  return tokens / 1000000 * map[model];
}

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
  await saveConfig(config, rcPath);
}

if (!config.model) {
  await chooseModel();
}

function printHelp() {
  console.log('  .set_model         choose model');
  console.log('  .set_api_key       set api key');
  console.log('  .set_system        set system prompt');
  console.log('  .clear             clean context');
  console.log('  .exit              exit the program');
  console.log('  .set_verbose       turn on/off verbose mode');
  console.log('  .add_file          add a file into chat session');
  console.log('  .add_image         add an image into chat session');
  console.log('  .help              show this help');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkg = loadJSONSync(path.join(__dirname, '../package.json'));
console.log(`Welcome to KIMI CLI(v${pkg.version}), type ${chalk.bgGray('.help')} for more information.`);
console.log(`Current model is ${chalk.bgGreen(config.model)}.`);

const balance = await kimi.getBalance();
const {available_balance, cash_balance, voucher_balance } = balance.data;
if (voucher_balance > 0) {
  console.log(`Current balance: ￥${available_balance}(Cash: ￥${cash_balance}, Voucher: ￥${voucher_balance}).`);
} else {
  console.log(`Current balance: ￥${available_balance}.`);
}

if (config.system) {
  messages.push({
    role: 'system',
    content: config.system
  });
}

// for vision
const images = [];

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
    await saveConfig(config, rcPath);
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
    await saveConfig(config, rcPath);
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

  if (answer === '.add_image') {
    let imagePath = await question({
      type: 'input',
      message: 'Please type your image path:',
    });

    if (imagePath.startsWith('~')) {
      imagePath = path.join(homedir(), imagePath.slice(1));
    }

    const base64 = await readFile(imagePath, 'base64');
    console.log(`The image '${imagePath}' is added into chat session.`);
    images.push(`data:${getMIME(path.extname(imagePath))};base64,${base64}`);
    continue;
  }

  if (answer === '.set_system') {
    const oldSystem = config.system;
    const system = await question({
      type: 'input',
      message: 'Please input system role content:',
      mask: '*'
    });

    config.system = system;
    await saveConfig(config, rcPath);

    if (oldSystem) {
      // rewrite system content
      const systemMessage = messages.find((d) => {
        return d.role === 'system' && d.content === oldSystem;
      });
      if (systemMessage) {
        systemMessage.content = system;
      }
    } else {
      // append system content
      messages.unshift({
        role: 'system',
        content: config.system
      });
    }
    continue;
  }

  if (images.length > 0 && isVisionModel(config.model)) {
    messages.push({
      'role': 'user',
      'content': [
        ...images.map((d) => {
          return {
            'type': 'image_url',
            'image_url': {
              'url': d
            }
          };
        }),
        {
          'type': 'text',
          'text': answer
        }
      ]
    });
    // 清理已保存的图片
    images.length = 0;
  } else {
    messages.push({'role': 'user', 'content': answer});
  }

  let response;
  try {
    response = await kimi.chat(messages, {
      model: config.model
    });
  } catch (ex) {
    if (ex.type === 'rate_limit_reached_error' && ex.code === 429) {
      if (config.verbose) {
        console.log(chalk.gray('[Verbose] Hit rate limit, try again after 3 second'));
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
    console.log(chalk.gray(`[Verbose] Request ID: ${data.id}`));
    const fee = cost(config.model, total_tokens);
    let costText;
    if (Array.isArray(fee)) {
      costText = `¥${ fee[0].toFixed(6) } to ¥${ fee[1].toFixed(6) }`;
    } else {
      costText = `¥${ fee.toFixed(6) }`;
    }
    console.log(chalk.gray(`[Verbose] Used tokens: ${total_tokens}(${prompt_tokens}/${ completion_tokens }), cost ${costText}`));
  }
}
