# The Node.js library and CLI for Moonshot AI

[![Node.js CI](https://github.com/JacksonTian/kimi/actions/workflows/test.yaml/badge.svg)](https://github.com/JacksonTian/kimi/actions/workflows/test.yaml)
[![codecov][cov-image]][cov-url]
[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/kimi.svg?style=flat-square
[npm-url]: https://npmjs.org/package/kimi
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

```sh
$ kimi
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

## License

The [MIT license](./LICENSE).
