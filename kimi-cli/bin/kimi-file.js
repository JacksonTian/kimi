#!/usr/bin/env node

import process from 'process';

import Kimi from '@jacksontian/kimi';

import { getAPIKey } from '../lib/apikey.js';

const apiKey = await getAPIKey();

if (!apiKey) {
  console.log('Can not found api key, please set api key via command kimi first.');
  process.exit(1);
}

const kimi = new Kimi({apiKey: apiKey});

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
  console.log(JSON.stringify(result, null, 2));
} else if (command === 'upload') {
  const [filePath] = args;
  const result = await kimi.putFile(filePath, 'file-extract');
  console.log(result);
}
