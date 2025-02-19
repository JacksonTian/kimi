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
npm i @jacksontian/kimi-cli -g # for CLI
```

It provides these commands:

- `kimi`. It helps to chat with KIMI and manage api-key.
- `kimi-file`. It helps to manage files.

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

We support command `kimi-file` to manage files.

```bash
$ kimi-file # list all files
| id                   | filename                       | purpose      | type | size       | created_at          | status |
| -------------------- | ------------------------------ | ------------ | ---- | ---------- | ------------------- | ------ |
| co6efvg3r07e3eepmxxx | 1906.08237.pdf                 | file-extract | file | 761790     | 2024-04-03 05:24:14 | ok     |
$ kimi-file upload ~/xxx/test.pdf   # upload file
$ kimi-file get the-file-id         # get file
$ kimi-file rm the-file-id          # delete file
```

You can use `.add_file` command to choose a uploaded file into chat session:

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

### Use Vision model

You can use `.add_image` command to add image into chat session:

```bash
Welcome to KIMI CLI(v1.1.0), type .help for more information.
Current model is kimi-latest.
What is your query: .add_image
? Please type your image path: ~/Downloads/kimi-logo.png
The image '/Users/x/Downloads/kimi-logo.png' is added into chat session.
What is your query: 解读一下这个图片
解读一下这个图片
这个图片展示了一个字母“K”的设计。字母“K”是大写的，采用了一种现代、简洁的字体风格。字母“K”的右上角有一个蓝色的小圆点，这个圆点可能是设计的一部分，用来增加视觉上的趣味性或作为品牌标识的一部分。背景是黑色的，使得白色的字母“K”和蓝色的圆点更加突出。整体设计简洁而现代，可能用于品牌标识、标志或图标设计。
```

## License

The [MIT license](./LICENSE).
