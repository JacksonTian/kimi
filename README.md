# The Node.js library and CLI for Moonshot AI

[![Node.js CI](https://github.com/JacksonTian/kimi/actions/workflows/test.yaml/badge.svg)](https://github.com/JacksonTian/kimi/actions/workflows/test.yaml)
[![codecov][cov-image]][cov-url]
[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/%40jacksontian%2Fkimi
[npm-url]: https://npmjs.org/package/@jacksontian/kimi
[cov-image]: https://codecov.io/gh/JacksonTian/kimi/branch/master/graph/badge.svg
[cov-url]: https://codecov.io/gh/JacksonTian/kimi
[download-image]: https://img.shields.io/npm/dm/%40jacksontian%2Fkimi
[download-url]: https://npmjs.org/package/@jacksontian/kimi

## Installation/安装

```sh
npm i @jacksontian/kimi -g # for CLI
npm i @jacksontian/kimi # for scripting
```

## Usage for CLI

### Set API key

You can visit <https://platform.moonshot.cn/console/api-keys> to get api key.

When you use `kimi` or `kimi-file` first time, will prompt you to set api key.

```bash
$ kimi
? Please input your kimi api key(you can visit https://platform.moonshot.cn/console/api-keys to get api key): ***************************************************
Welcome to KIMI CLI(v1.0.0), type .help for more information.
Current model is moonshot-v1-32k.
What is your query: 
```

Or you can re-set it with `.set_api_key` command.

### Chat with KIMI

```sh
$ kimi
Welcome to KIMI CLI(v1.0.0), type .help for more information.
Current model is moonshot-v1-128k.
What is your query: 写一首七言唐诗
春风拂面桃花开，
绿水青山共舞来。
鸟语花香满园中，
人间仙境难寻觅。

夕阳西下映江面，
渔舟唱晚共欢颜。
岁月匆匆莫虚度，
共赏繁华似锦年。
[Verbose] request id: chatcmpl-5cc0493c22fb4268b0772b08300886b1, usage tokens: 62
```

### File helper

We support a tiny command to manage files.

```bash
$ kimi-file # list all files
| id                   | filename                       | purpose      | type | size       | created_at          | status |
| -------------------- | ------------------------------ | ------------ | ---- | ---------- | ------------------- | ------ |
| co6efvg3r07e3eepmxxx | 1906.08237.pdf                 | file-extract | file | 761790     | 2024-04-03 05:24:14 | ok     |
$ kimi-file upload ~/xxx/test.pdf   # upload file
$ kimi-file get the-file-id         # get file
$ kimi-file rm the-file-id          # delete file
```

You can use `.add_file` command to choose a uploaded file:

```bash
$ kimi
Welcome to KIMI CLI(v1.0.0), type .help for more information.
Current model is moonshot-v1-128k.
What is your query: .add_file
? Please select your file: (Use arrow keys)
? Please select your file: 1906.08237.pdf
The file 1906.08237.pdf is added into chat session.
What is your query: 请解读 1906.08237.pdf 文件内容
```

### Switch model

You can use `.set_model` command to switch models:

```bash
$ kimi
Welcome to KIMI CLI(v1.0.0), type .help for more information.
Current model is moonshot-v1-128k.
What is your query: .set_model
? Please select your model: 
? Please select your model: moonshot-v1-32k
The model is switched to moonshot-v1-32k now.
```

## Usage for scripting

```js
import Kimi from '@jacksontian/kimi';

const client = new Kimi({
    // Do not hard code it here, read it from configuration or enviroment variables
    apiKey: 'The API key for moonshot AI'
});
const response = await client.models();
```

## API

- `chat()`
- `models()`
- `putFile()`
- `putFileStream()`
- `files()`
- `getFile()`
- `getFileContent()`
- `deleteFile()`
- `estimateTokenCount()`
- `getBalance()`

The detail of parameters can be found at <https://platform.moonshot.cn/docs/api-reference> or [`test/kimi.test.js`](./test/kimi.test.js).

## License

The [MIT license](./LICENSE).
