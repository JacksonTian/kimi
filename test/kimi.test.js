import assert from 'assert';
import path from 'path';
import { readAsSSE } from 'httpx';
import { fileURLToPath } from 'url';

import Kimi from '../lib/kimi.js';

const KIMI_API_KEY = process.env.KIMI_API_KEY;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('kimi', () => {
  it('chat should ok', async function ()  {
    this.timeout(60000);
    const client = new Kimi({
      apiKey: KIMI_API_KEY
    });
    const response = await client.chat([
      {role: 'user', content: 'Hello world'}
    ], {
      model: 'moonshot-v1-128k'
    });
    let content = '';
    for await (const event of readAsSSE(response)) {
      if (event.data !== '[DONE]') {
        const data = JSON.parse(event.data);
        if (data.choices[0].finish_reason !== 'stop') {
          content += data.choices[0].delta.content;
        }
      }
    }
    assert.ok(content.length > 20);
  });

  it('chat with tool should ok', async function ()  {
    this.timeout(60000);
    const client = new Kimi({
      apiKey: KIMI_API_KEY
    });
    const response = await client.chat([
      {role: 'user', content: '3214567是素数吗?'}
    ], {
      model: 'moonshot-v1-128k',
      'tools': [
        {
          'type': 'function',
          'function': {
            'name': 'CodeRunner',
            'description': '代码执行器，支持运行 python 和 javascript 代码',
            'parameters': {
              'properties': {
                'language': {
                  'type': 'string',
                  'description': 'python or javascript'
                },
                'code': {
                  'type': 'string',
                  'description': '代码写在这里'
                }
              },
              'type': 'object'
            }
          }
        }
      ]
    });
    let toolCall = null;
    let content = '';
    for await (const event of readAsSSE(response)) {
      console.log(event);
      if (event.data !== '[DONE]') {
        const data = JSON.parse(event.data);
        const choice = data.choices[0];
        if (choice.finish_reason !== 'tool_calls') {
          if (choice.delta.content) {
            content += choice.delta.content;
          }
          if (choice.delta.tool_calls) {
            if (!toolCall) {
              toolCall = choice.delta.tool_calls[0];
            } else {
              toolCall.function.arguments += choice.delta.tool_calls[0].function.arguments;
            }
          }
        }
      }
    }

    assert.strictEqual(toolCall.index, 0);
    assert.strictEqual(toolCall.id, 'CodeRunner:0');
    assert.strictEqual(toolCall.type, 'function');
    assert.strictEqual(toolCall.function.name, 'CodeRunner');
    assert.ok(toolCall.function.arguments.length > 0);
    console.log(content);
    assert.ok(content.length > 20);
  });

  it('files should ok', async function() {
    this.timeout(60000);
    const client = new Kimi({
      apiKey: KIMI_API_KEY
    });
    const result = await client.files();
    assert.deepStrictEqual(result.object, 'list');
    assert.ok(result.data.length >= 0);
    result.data.forEach((d) => {
      assert.strictEqual(d.status, 'ok');
    });

    const fileResult = await client.putFile(path.join(__dirname, './figures/1906.08237.pdf'), 'file-extract');
    assert.deepStrictEqual(fileResult.bytes, 761790);
    assert.strictEqual(fileResult.status, 'ok');
    const id = fileResult.id;
    const file = await client.getFile(id);
    assert.strictEqual(file.bytes, 761790);
    const content = await client.getFileContent(id);
    assert.strictEqual(content.filename, '1906.08237.pdf');
    assert.ok(content.content.length > 0);
    const deleteResult = await client.deleteFile(id);
    assert.strictEqual(deleteResult.deleted, true);
  });

  it('files handle error should ok', async () => {
    const client = new Kimi({
      apiKey: KIMI_API_KEY
    });

    try {
      await client.putFile(path.join(__dirname, './figures/invalid_format.txt'), 'file-extract');
    } catch (ex) {
      assert.strictEqual(ex.message, 'invalid_request_error: File size is zero, please confirm and re-upload the file. Access https://api.moonshot.cn/v1/files failed(400)');
      return;
    }

    assert.fail('should not to here');
  });

  it('models should ok', async () => {
    const client = new Kimi({
      apiKey: KIMI_API_KEY
    });
    const models = await client.models();
    const names = models.data.map((d) => {
      return d.id;
    }).sort();
    assert.deepStrictEqual(names, [
      'moonshot-v1-128k',
      'moonshot-v1-32k',
      'moonshot-v1-8k',
      'moonshot-v1-auto'
    ]);
  });

  it('estimateTokenCount should ok', async () => {
    const client = new Kimi({
      apiKey: KIMI_API_KEY
    });
    const results = await client.estimateTokenCount([
      {role: 'user', content: 'Hello'}
    ], {
      model: 'moonshot-v1-128k'
    });
    assert.deepStrictEqual(results, {
      code: 0,
      data: {
        multimodal: false,
        total_tokens: 8
      },
      scode: '0x0',
      status: true
    });
  });

  it('getBalance should ok', async () => {
    const client = new Kimi({
      apiKey: KIMI_API_KEY
    });
    const results = await client.getBalance();
    const data = results.data;
    assert.ok(data.available_balance >= 0);
    assert.ok(data.cash_balance >= 0);
    assert.ok(data.voucher_balance >= 0);
    assert.strictEqual(results.code, 0);
    assert.strictEqual(results.scode, '0x0');
    assert.strictEqual(results.status, true);
  });

  it('caches should ok', async function() {
    this.timeout(60000);
    const client = new Kimi({
      apiKey: KIMI_API_KEY
    });
    const result = await client.getCaches();
    console.log(result);
  });

});
