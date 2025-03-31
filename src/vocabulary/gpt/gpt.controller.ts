import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { GptService } from './gpt.service';

@Controller('gpt')
export class GptController {
	constructor(private readonly gptService: GptService) { }

	@Post('classify')
	async classify(@Body('text') text: string, @Body('userId') userId: string) {
		const result = await this.gptService.classifyWord(userId, text);
		return JSON.parse(result);
	}

	@Get('monthly-stats/:month') // например, '2025-03'
	getStats(@Param('month') month: string) {
		return this.gptService.getMonthlyStats(month);
	}
}
