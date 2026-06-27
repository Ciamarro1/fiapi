const { BaseModelProvider } = require('@ag-kit/agents');
const { CIA_RESPONSES, CTO_RESPONSES } = require('./simulation-data');

class FallbackModelProvider extends BaseModelProvider {
  constructor(config = {}) {
    super(config);
    this.config = config;
  }

  get chat() {
    return {
      completions: {
        create: async (params) => {
          return this.createCompletion(params);
        },
        stream: async function* (params) {
          const res = await this.createCompletion(params);
          yield {
            id: res.id,
            object: 'chat.completion.chunk',
            created: res.created,
            model: res.model,
            choices: [
              {
                index: 0,
                delta: {
                  role: 'assistant',
                  content: res.choices[0].message.content
                },
                finish_reason: 'stop'
              }
            ]
          };
        }.bind(this)
      }
    };
  }

  getProviderName() {
    return 'fallback-model-provider';
  }

  getDefaultModel() {
    return '@cf/meta/llama-3-8b-instruct';
  }

  formatTools(tools) {
    return tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.schema || {}
      }
    }));
  }

  parseToolCalls(response) {
    return [];
  }

  async createCompletion(params) {
    const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

    if (cloudflareAccountId && cloudflareApiToken) {
      try {
        const url = `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/ai/v1/run/@cf/meta/llama-3-8b-instruct`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cloudflareApiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: params.messages.map(m => ({ role: m.role, content: m.content })),
            max_tokens: params.max_tokens || 2048,
            temperature: params.temperature || 0.7
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.result && data.result.response) {
            return {
              id: `cf-${Date.now()}`,
              object: 'chat.completion',
              created: Math.floor(Date.now() / 1000),
              model: params.model || '@cf/meta/llama-3-8b-instruct',
              choices: [
                {
                  index: 0,
                  message: {
                    role: 'assistant',
                    content: data.result.response
                  },
                  finish_reason: 'stop'
                }
              ],
              usage: {
                prompt_tokens: 0,
                completion_tokens: 0,
                total_tokens: 0
              }
            };
          }
        }
      } catch (err) {
        console.warn('Cloudflare Workers AI call failed, trying Anthropic failover...', err.message);
      }
    }

    if (anthropicApiKey) {
      try {
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20240620',
            max_tokens: params.max_tokens || 2048,
            temperature: params.temperature || 0.7,
            messages: params.messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content })),
            system: params.messages.find(m => m.role === 'system')?.content || ''
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.content && data.content[0] && data.content[0].text) {
            return {
              id: `anthropic-${data.id}`,
              object: 'chat.completion',
              created: Math.floor(Date.now() / 1000),
              model: 'claude-3-5-sonnet-20240620',
              choices: [
                {
                  index: 0,
                  message: {
                    role: 'assistant',
                    content: data.content[0].text
                  },
                  finish_reason: 'stop'
                }
              ],
              usage: {
                prompt_tokens: data.usage?.input_tokens || 0,
                completion_tokens: data.usage?.output_tokens || 0,
                total_tokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
              }
            };
          }
        }
      } catch (err) {
        console.warn('Anthropic failover call failed, using simulation...', err.message);
      }
    }

    // Offline simulation fallback
    return this.simulateCompletion(params);
  }

  simulateCompletion(params) {
    const systemMessage = params.messages.find(m => m.role === 'system')?.content || '';
    const isCIA = systemMessage.includes('Chief Intelligence Architect') || systemMessage.includes('CIA');

    const userMessages = params.messages.filter(m => m.role === 'user' || m.role === 'assistant');
    let responseContent = '';
    
    if (isCIA) {
      const idx = Math.min(Math.floor(userMessages.length / 2), CIA_RESPONSES.length - 1);
      responseContent = CIA_RESPONSES[idx];
    } else {
      const idx = Math.min(Math.floor((userMessages.length - 1) / 2), CTO_RESPONSES.length - 1);
      responseContent = CTO_RESPONSES[idx];
    }

    return {
      id: `sim-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: params.model || 'simulation',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: responseContent
          },
          finish_reason: 'stop'
        }
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    };
  }
}

module.exports = { FallbackModelProvider };
