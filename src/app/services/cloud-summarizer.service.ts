import { Inject, Injectable } from '@angular/core';
import {
	getVertexAI,
	getGenerativeModel,
	GenerativeModel,
} from 'firebase/vertexai';
import { FIREBASE } from '../app.config';
import { FirebaseApp } from 'firebase/app';
import { Summarizer } from './summarizer';
import { Article } from '../models/article';

@Injectable({
	providedIn: 'root',
})
export class CloudSummarizerService implements Summarizer {

	name: string = "Gemini Flash 1.5";

	constructor(@Inject(FIREBASE) private readonly firebaseApp: FirebaseApp) {}

	private generativeModel?: GenerativeModel;

	async initialize(): Promise<void> {
		const vertexai = getVertexAI(this.firebaseApp);
		this.generativeModel = getGenerativeModel(vertexai, {
			model: 'gemini-1.5-flash-001',
		});
		return Promise.resolve();
	}

	async summarize(text: string, link: string): Promise<Partial<Article>> {
		// Provide a prompt that contains text
		const prompt = `Summarize the following text: \n ${text}`;
		console.log(`Generated prompt: ${prompt}`);
		// To generate text output, call generateContent with the text input
		const result = await this.generativeModel?.generateContent(prompt);
		console.log(`Generated summary: ${result}`);
		const response = result?.response;
		const summary = response?.text() ?? 'Summarization failed. Please try again.'
		return {
			summary,
			author: (await this.searchAuthor(text)) ?? 'No author found',
			date: (await this.searchPublicationDate(text)) ?? 'No date found',
			title: (await this.giveTitle(summary)) ?? 'No title found',
		};
	}

	async searchAuthor(text: string): Promise<string> {
		try {
			const result = await this.generativeModel?.generateContent(
				`In the following text, search for the author of the article. Only answer with the author's name or 'No author found' if no author is provided:${text}`
			);
			const response = result?.response;
			console.log(`Answer: Author ${response?.text()}.`);
			return response?.text().toLowerCase().trim() ?? 'no author found';
		} catch (error) {
			console.error(`Failed to search author: ${error}`);
			return 'No author found';
		}
	}

	async searchPublicationDate(text: string): Promise<string> {
		try {
			const result = await this.generativeModel?.generateContent(
				`In the following text, your task is to search for publication date. Only answer with the publication date or 'No date found' if no date is provided: ${text}`
			);
			const response = result?.response;
			console.log(`Answer: Date ${response?.text()}.`);
			return response?.text().toLowerCase().trim() ?? 'no date found';
		} catch (error) {
			console.error(`Failed to search publication date: ${error}`);
			return 'No date found';
		}
	}

	async giveTitle(text: string): Promise<string> {
		try {
			const result = await this.generativeModel?.generateContent(
				`Given the following summary, generate a short title for the article, only answer with the title:
        ${text}`
			);
			console.log(`Answer: Title ${result?.response.text().trim()}.`);
			return result?.response?.text().trim() ?? "Untitled article";
		} catch (error) {
			console.error(`Failed to generate title: ${error}`);
			return 'No title given';
		}
	}

	async answerQuestion(text: string, articles: Article[]): Promise<Article[]> {
        try {
			const toReturn = [];
			for (const article of articles) {
				const result = await this.generativeModel?.generateContent(
					`Given the following article and a question, indicate if an answer to the question is given in the article, only answer with 'YES' or 'NO'.
					Article: ${article.content}
					Question: ${text}`
				);
				console.log(`Answer to question ${text}: ${result?.response.text().trim()}.`);
				if(result?.response?.text()?.toLowerCase().trim() === 'yes')
					toReturn.push(article)
			}
			return toReturn;
			
		} catch (error) {
			console.error(`Failed to generate answer: ${error}`);
			return [];
		}
    }
}
