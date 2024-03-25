import { request, read } from 'httpx';
import fs from 'fs';

const endpoint = 'https://api.moonshot.cn';

export default class Kimi {
  constructor(options = {}) {
    this.endpoint = options.endpoint || endpoint;
    this.apiKey = options.apiKey;
    this.temperature = 0;
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

    if (response.statusCode !== 200) {
      throw new Error(`Access ${url} failed(${response.statusCode})`);
    }
  
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
    const body = await read(response, 'utf8');
    return JSON.parse(body);
  }
  
  async putFile(filePath, purpose) {
    return this.putFileStream(fs.createReadStream(filePath), purpose);
  }

  async putFileStream(readable, purpose) {
    const url = `${this.endpoint}/v1/files`;
    const response =  await request(url, {
      method: 'POST',
      timeout: 60000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
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
    const body = await read(response, 'utf8');
    return JSON.parse(body);
  }
}
