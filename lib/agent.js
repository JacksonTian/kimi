import { readAsSSE } from 'httpx';

function getTools(toolMap) {
  const tools = [];
  for (const [key, tool] of toolMap) {
    const properties = {};
    for (const [paramName, parameter] of Object.entries(tool.parameters)) {
      properties[paramName] = parameter;
    }

    tools.push({
      'type': 'function',
      function: {
        name: key,
        description: tool.description,
        parameters: {
          'properties': properties,
          'type': 'object'
        }
      }
    });
  }

  return tools;
}

export default class Agent {
  constructor(kimi, model) {
    this.kimi = kimi;
    this.model = model;
    this.tools = new Map();
  }

  registerTool(define, method) {
    this.tools.set(define, method);
  }

  async chatWithTool(message) {
    const response = await this.kimi.chat([
      {
        role: 'user',
        content: message
      }
    ], {
      model: this.model,
      tools: getTools(this.tools)
    });

    let toolCalls = [];
    let content = '';
    for await (const event of readAsSSE(response)) {
      if (event.data !== '[DONE]') {
        const data = JSON.parse(event.data);

        const choice = data.choices[0];
        if (choice.finish_reason !== 'tool_calls') {
          if (choice.delta.content) {
            content += choice.delta.content;
          }
          if (choice.delta.tool_calls) {
            const toolCall = choice.delta.tool_calls[0];
            const index = toolCall.index;

            if (!toolCalls[index]) {
              toolCalls[index] = toolCall;
            } else {
              toolCalls[index].function.arguments += toolCall.function.arguments;
            }
          }
        }
      }
    }

    return {content, toolCalls};
  }

  async chat(promt) {
    const {content, toolCalls} = await this.chatWithTool(promt);
    const toolResults = [];
    for (const toolCall of toolCalls) {
      const result = await this.runTool(toolCall);
      toolResults.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: result
      });
    }

    const messages = [
      {role: 'user', content: promt},
      {role: 'assistant', content, tool_calls: toolCalls},
      ...toolResults
    ];
    console.log(messages);
    const response = await this.kimi.chat(messages, {
      model: this.model,
    });
    let lastEvent;
    let message = '';
    for await (const event of readAsSSE(response)) {
      if (event.data !== '[DONE]') {
        const data = JSON.parse(event.data);
        const choice = data.choices[0];
        if (choice.finish_reason === 'content_filter') {
          console.log(event);
        } else if (choice.finish_reason === 'stop') {
          lastEvent = event;
        } else if (!choice.finish_reason) {
          const content = choice.delta.content;
          if (content) {
            process.stdout.write(content);
            message += content;
          }
        }
      } else {
        console.log();
      }
    }
  }

  async runTool(call) {
    const tool = this.tools.get(call.function.name);
    const args = JSON.parse(call.function.arguments);
    const result = await tool.method(args);
    return result;
  }
}