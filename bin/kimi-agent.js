import Agent from '../lib/agent.js';
import Kimi from '../lib/kimi.js';
import { getAPIKey } from '../lib/apikey.js';

const apiKey = await getAPIKey();

const kimi = new Kimi({
  apiKey
});

const agent = new Agent(kimi, 'moonshot-v1-8k');

agent.registerTool('call', {
  description: '根据人名判断性别，如果是男孩子，会返回男，如果是女孩子，会返回女',
  parameters: {
    name: {
      type: 'string',
      description: '姓名，人的名字'
    }
  },
  method: async function (args) {
    return Math.random() > 0.5 ? '男' : '女';
  }
});
agent.registerTool('searchAPI', {
  description: '搜索 API，根据需求、功能描述，找到可以实现该功能的接口',
  parameters: {
    query: {
      type: 'string',
      description: '问题描述，比如发送短信该用哪个 API'
    }
  },
  method: async function (args) {
    return 'CreateInstance';
  }
});

agent.registerTool('searchProduct', {
  description: '根据意图确定产品是什么',
  parameters: {
    query: {
      type: 'string',
      description: '用户的意图，可能是在找一个功能，也可能是在找一个接口'
    }
  },
  method: async function (args) {
    return `ecs`;
  }
});

agent.registerTool('clicommand', {
  description: '参数，生成 aliyun 命令行语句，产品名依赖其它工具来进行判断',
  parameters: {
    product: {
      type: 'string',
      description: '产品名，产品名需要通过其它工具来进行确认'
    },
    api: {
      type: 'string',
      description: 'API 名字'
    }
  },
  method: async function (args) {
    return `aliyun ${args.product} ${args.api}`;
  }
});

const [prompt] = process.argv.slice(2);
await agent.chat(prompt);

process.exit(0);