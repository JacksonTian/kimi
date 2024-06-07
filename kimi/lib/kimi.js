import { request, read } from 'httpx';
import fs from 'fs';
import path from 'path';
import FileForm, { FileField } from '@alicloud/tea-fileform';
import mime from 'mime';

const endpoint = 'https://api.moonshot.cn';

export default class Kimi {
  constructor(options = {}) {
    this.endpoint = options.endpoint || endpoint;
    this.apiKey = options.apiKey;
    this.temperature = 0;
  }

  async #handleError(url, response) {
    if (response.statusCode !== 200) {
      const body = await read(response, 'utf8');
      const result = JSON.parse(body);
      const { error } = result;
      const err = new Error();
      err.message = `${error.type}: ${error.message}. Access ${url} failed(${response.statusCode})`;
      err.type = error.type;
      err.code = response.statusCode;
      throw err;
    }
  }

  async chat(messages, options = {}) {
    const body = {
      messages: messages,
      temperature: this.temperature,
      stream: true,
      ...options
    };

    const url = `${this.endpoint}/v1/chat/completions`;
    const response = await request(url, {
      method: 'POST',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'Authorization': `Bearer ${this.apiKey}`
      },
      data: JSON.stringify(body)
    });

    await this.#handleError(url, response);

    return response;
  }

  async files() {
    const url = `${this.endpoint}/v1/files`;
    const response =  await request(url, {
      timeout: 60000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    await this.#handleError(url, response);

    const body = await read(response, 'utf8');
    return JSON.parse(body);
  }
  
  async putFile(filePath, purpose) {
    return this.putFileStream(fs.createReadStream(filePath), filePath, purpose);
  }

  async putFileStream(readable, filePath, purpose) {
    const url = `${this.endpoint}/v1/files`;
    const contentType = mime.getType(path.extname(filePath));
    const form = {
      purpose,
      file: new FileField({
        filename: path.basename(filePath),
        contentType: contentType,
        content: readable
      })
    };

    const boundary = FileForm.default.getBoundary();
    const response =  await request(url, {
      method: 'POST',
      timeout: 60000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      data: FileForm.default.toFileForm(form, boundary)
    });

    await this.#handleError(url, response);

    const body = await read(response, 'utf8');
    return JSON.parse(body);
  }

  async getFile(fileId) {
    const url = `${this.endpoint}/v1/files/${fileId}`;
    const response =  await request(url, {
      timeout: 60000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    await this.#handleError(url, response);

    const body = await read(response, 'utf8');
    return JSON.parse(body);
  }

  async deleteFile(fileId) {
    const url = `${this.endpoint}/v1/files/${fileId}`;
    const response =  await request(url, {
      method: 'DELETE',
      timeout: 60000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    await this.#handleError(url, response);

    const body = await read(response, 'utf8');
    return JSON.parse(body);
  }

  async getFileContent(fileId) {
    const url = `${this.endpoint}/v1/files/${fileId}/content`;
    const response =  await request(url, {
      timeout: 60000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    await this.#handleError(url, response);

    const body = await read(response, 'utf8');
    return JSON.parse(body);
  }
  
  async models() {
    const url = `${this.endpoint}/v1/models`;
    const response =  await request(url, {
      timeout: 60000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    await this.#handleError(url, response);

    const body = await read(response, 'utf8');
    return JSON.parse(body);
  }

  async estimateTokenCount(messages, options = {}) {
    const url = `${this.endpoint}/v1/tokenizers/estimate-token-count`;
    const response =  await request(url, {
      method: 'POST',
      timeout: 60000,
      data: JSON.stringify({
        messages: messages,
        temperature: this.temperature,
        stream: true,
        ...options 
      }),
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    await this.#handleError(url, response);

    const body = await read(response, 'utf8');
    return JSON.parse(body);
  }

  async getBalance() {
    const url = `${this.endpoint}/v1/users/me/balance`;
    const response =  await request(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
    await this.#handleError(url, response);

    const body = await read(response, 'utf8');
    return JSON.parse(body);
  }

}
