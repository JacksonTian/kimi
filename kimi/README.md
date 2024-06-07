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
npm i @jacksontian/kimi # for scripting
```

## Usage

```js
import Kimi from '@jacksontian/kimi';

const client = new Kimi({
    // Do not hard code it here, read it from configuration or enviroment variables
    apiKey: 'The API key for moonshot AI'
});
const response = await client.models();
```

## API

- Chat
  - `chat()`
  - `models()`
  - `estimateTokenCount()`

- Files
  - `putFile()`
  - `putFileStream()`
  - `files()`
  - `getFile()`
  - `getFileContent()`
  - `deleteFile()`

- Others
  - `getBalance()`

The detail of parameters can be found at <https://platform.moonshot.cn/docs/api-reference> or [`test/kimi.test.js`](./test/kimi.test.js).

## License

The [MIT license](./LICENSE).
