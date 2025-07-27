import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';


@Injectable()

export class GptService {
	constructor(private configService: ConfigService) {}

	private readonly apiKey = this.configService.get<string>('OPENAI_API_KEY');
	private readonly MAX_REQUESTS_PER_MONTH = 50;

	private getLogFilePath(): string {
		return path.join(__dirname, './gpt-usage-log.json');
	}
	
	private readLogs(): any[] {
		const logFilePath = this.getLogFilePath();
		if (fs.existsSync(logFilePath)) {
			const fileContent = fs.readFileSync(logFilePath, 'utf-8');
			return JSON.parse(fileContent);
		}
		return [];
	}
	
	private saveLog(data: any) {
    const logFilePath = path.join(__dirname, './gpt-usage-log.json');

    let logs = [];

    if (fs.existsSync(logFilePath)) {
      const fileContent = fs.readFileSync(logFilePath, 'utf-8');
      logs = JSON.parse(fileContent);
    }

    logs.push(data);

    fs.writeFileSync(logFilePath, JSON.stringify(logs, null, 2));
  }
	
	private checkUserLimit(userId: string): boolean {
		const now = new Date();
		const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
	
		const logs = this.readLogs();
	
		const userLogsThisMonth = logs.filter(
			(log) =>
				log.userId === userId && log.timestamp.startsWith(currentMonth)
		);
	
		return userLogsThisMonth.length < this.MAX_REQUESTS_PER_MONTH;
	}

	

  async classifyWord(userId: string, input: string): Promise<any> {
		console.log('[GPTService] Requête utilisateur:', userId);
		console.log('[GPTService] Mot à classifier:', input);
	
		if (!this.checkUserLimit(userId)) {
			console.warn(`[GPTService] Limite requêtes GPT épuisée pour utilisateur "${userId}"`);
			throw new Error(`Limite requêtes GPT épuisée pour utilisateur "${userId}"`);
		}
	
		const payload = {
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'system',
					content: 'Tu es un dictionnaire visuel. Classifie le mot par thème et sous-thème de la liste, retourne uniquement JSON {"theme": "...", "subtheme": "..."}',
				},
				{
					role: 'user',
					content: `Mot: "${input}"`,
				},
			],
			temperature: 0.3,
		};
	
		const headers = {
			Authorization: `Bearer ${this.apiKey}`,
			'Content-Type': 'application/json',
		};
	
		try {
			const response = await axios.post(
				'https://api.openai.com/v1/chat/completions',
				payload,
				{ headers },
			);
	
			const content = response.data.choices[0].message.content;
			console.log('[GPTService] Réponse GPT:', content);
	
			const usage = response.data.usage;
			const timestamp = new Date().toISOString();
	
			const logData = {
				userId,
				timestamp,
				promptTokens: usage.prompt_tokens,
				completionTokens: usage.completion_tokens,
				totalTokens: usage.total_tokens,
			};
	
			console.log('[GPTService] Log utilisation tokens:', logData);
			this.saveLog(logData);
	
			return content;
	
		} catch (error) {
			if (error.response?.status === 429) {
				console.warn('[GPTService] Limite requêtes OpenAI dépassée (429). Pause 2 sec et retry...');
				await new Promise(resolve => setTimeout(resolve, 2000));
	
				// requête de retry (une seule fois pour éviter les boucles)
				try {
					const retryResponse = await axios.post(
						'https://api.openai.com/v1/chat/completions',
						payload,
						{ headers },
					);
	
					const retryContent = retryResponse.data.choices[0].message.content;
					const usage = retryResponse.data.usage;
					const timestamp = new Date().toISOString();
	
					const logData = {
						userId,
						timestamp,
						promptTokens: usage.prompt_tokens,
						completionTokens: usage.completion_tokens,
						totalTokens: usage.total_tokens,
					};
	
					console.log('[GPTService] Réponse GPT (après retry):', retryContent);
					console.log('[GPTService] Log (retry):', logData);
					this.saveLog(logData);
	
					return retryContent;
				} catch (retryError) {
					console.error('[GPTService] Erreur lors du retry GPT:', retryError.response?.data || retryError.message);
					throw new Error('Erreur GPT après retry: ' + (retryError.response?.data?.error?.message || retryError.message));
				}
			}
	
			// autres erreurs
			console.error('[GPTService] Erreur GPT:', error.response?.data || error.message);
			// TODO : implémenter un système de fallback ou cache
			throw new Error('Erreur GPT: ' + (error.response?.data?.error?.message || error.message));
		}
	}
	
	
	
	getMonthlyStats(month: string): any {
		const logs = this.readLogs();
	
		const stats: Record<string, { totalTokens: number; requests: number }> = {};
	
		logs.forEach((log) => {
			if (log.timestamp.startsWith(month)) {
				if (!stats[log.userId]) {
					stats[log.userId] = { totalTokens: 0, requests: 0 };
				}
				stats[log.userId].totalTokens += log.totalTokens;
				stats[log.userId].requests += 1;
			}
		});
	
		return stats;
	}
	

}
