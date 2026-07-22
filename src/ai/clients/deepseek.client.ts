import OpenAI from 'openai';
import { DEEPSEEK_API_KEY } from '../../../env';

export class AIClient {
    private client: OpenAI;

    constructor() {
        const apiKey = DEEPSEEK_API_KEY;
        if (!apiKey) {
            throw new Error('DeepSeek API key is not defined in environment variables.');
        }

        this.client = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey
        });
    }

    async chat(prompt: string) {
        const res = await this.client.chat.completions.create({
            model: 'deepseek-chat',
            messages: [{ role: 'user', content: prompt }],
        })

        return res.choices[0]?.message?.content;
    }
}