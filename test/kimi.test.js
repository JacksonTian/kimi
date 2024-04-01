import Kimi from '../lib/kimi.js';
import assert from 'assert';
import { fileURLToPath } from 'url';

const KIMI_API_KEY = process.env.KIMI_API_KEY;

describe('kimi', () => {
  it('files should ok', async () => {
    const client = new Kimi({
      apiKey: KIMI_API_KEY
    });
    const result = await client.files();
    assert.deepStrictEqual(result.object, 'list');
    assert.ok(result.data.length >= 0);
    result.data.forEach((d) => {
      assert.strictEqual(d.status, 'ok');
    });
    const fileResult = await client.putFile(fileURLToPath(import.meta.resolve('./figures/1906.08237.pdf')), 'file-extract');
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
      await client.putFile(fileURLToPath(import.meta.resolve('./figures/invalid_format.txt')), 'file-extract');
    } catch (ex) {
      assert.strictEqual(ex.message, '1906.08237.pdf');
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
      'moonshot-v1-8k'
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
    assert.deepStrictEqual(results, { code: 0, data: { total_tokens: 4 }, scode: '0x0', status: true });
  });

});
