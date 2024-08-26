import { Injectable } from '@angular/core';
import { SplitterService } from './splitter.service';
import { Summarizer } from './summarizer';
import { Article } from '../models/article';

declare const ai: any;
declare const window: any;

@Injectable()
export class SummarizerService implements Summarizer {
	private summarizer: any;

	name: string = "Gemini Nano";

	constructor(private readonly splitterService: SplitterService) {}

	async initialize(): Promise<void> {
		const canSummarize = await ai.summarizer.capabilities();
		if (canSummarize && canSummarize.available !== 'no') {
			if (canSummarize.available === 'readily') {
				// The summarizer can immediately be used.
				this.summarizer = await ai.summarizer.create();
			} else {
				// The summarizer can be used after the model download.
				this.summarizer = await ai.summarizer.create();
				this.summarizer.addEventListener(
					'downloadprogress',
					(e: any) => {
						console.log(e.loaded, e.total);
					}
				);
				await this.summarizer.ready;
			}
		} else {
			// The summarizer can't be used at all.
			console.error('Summarizer not available.');
		}
	}

	async smartSummarize(text: string, link: string): Promise<Partial<Article>> {
		let chunks,
			summaries = text;
		let agentRetry = false;
		do {
			agentRetry = false; // Resetting the agent retry flag.
			this.summarizer = await ai.summarizer.create();
			chunks = this.splitterService.chunkTextBySentence(summaries, 3800);
			summaries = ''; // Clearing the summaries for the next iteration.
			for (let index in chunks) {
				summaries += `${await this.summarizer.summarize(
					chunks[index]
				)}\n`;
			}
			summaries = summaries.trim(); // Removing leading and trailing whitespaces.
			if (
				chunks.length === 1 &&
				(await this.reflectOnSummarization(summaries)) === false
			) {
				summaries = chunks.join(' ').trim(); // If the summarization fails, revert to the first chunk.
				agentRetry = true; // Retrying with initial chunks in case of failure.
				console.error(
					'Summarization failed. Reverting to initial chunks.'
				);
			}
			console.log(`${summaries}`);
			this.summarizer.destroy();
		} while (chunks.length > 1 || agentRetry);
		const title = await this.giveTitle(summaries);
		let author = await this.searchAuthor(text);
		if(author.includes('no author found') || !await this.checkAuthorIsCorrect(author)){
			author = await this.searchAuthorFromLink(link);
		}
		let date = await this.searchPublicationDate(text);
		if(date.includes('no date found')){
			date = await this.searchDateFromLink(link);
		}
		return { summary: summaries, author, date, title };
	}

	async reflectOnSummarization(text: string): Promise<boolean> {
		const session = await window.ai.assistant.create({temperature: 0, topK: 10});
		const result = await session.prompt(
			`Is the following text finished? Only answer 'YES' or 'NO' when the text is a finished and a good summary:
      Procreate's CEO expressed distaste for generative AI, arguing that it undermines the human creative process and authentic
      NO
      <ctrl23>
      Procreate, an iOS illustration app, has opted against integrating generative AI into its products due to concerns about its ethical implications and potential negative impact on creative industries. Pro
      NO
      <ctrl23>
      Procreate, an illustration app, has nixing generative AI due to ethical and creative industry-related worries
      NO
      <ctrl23>
      ${text}`
		);
		console.log(`Answer: ${result.toLowerCase()} to ${text}.`);
		return result.toLowerCase().trim() === 'yes';
	}

	async giveTitle(text: string): Promise<string> {
		const session = await window.ai.assistant.create();
		try {
			const result = await session.prompt(
				`Given the following summary, generate a title for the article: 
        ${text}`
			);
			console.log(`Answer: Title ${result.trim()}.`);
			return result.trim();
		} catch (error) {
			console.error(`Failed to generate title: ${error}`);
			return 'No title given';
		} finally {
			session.destroy();
		}
	}

	summarize(text: string, link: string): Promise<Partial<Article>> {
		try {
			return this.smartSummarize(text, link);
		} catch (error) {
			console.error(`Failed to summarize article: ${error}`);
			return Promise.resolve({
				summary: 'Failed to summarize',
				author: 'No author found',
				date: 'No date found',
			});
		}
	}

	async searchAuthor(text: string): Promise<string> {
		const chunks = this.splitterService.chunkTextBySentence(text, 4000);
		let author = 'no author found';
		for (let index in chunks) {
			if (author === '' || author.includes('no author found')) {
				author = await this.searchAuthorFromChunk(chunks[index]);
			}
		}
		return author;
	}
	
	async searchPublicationDate(text: string): Promise<string> {
		const chunks = this.splitterService.chunkTextBySentence(text, 4000);
		let date = 'no date found';
		for (let index in chunks) {
			if (date === '' || date.includes('no date found')) {
				date = await this.searchDateFromChunk(chunks[index]);
			}
		}
		return date;
	}

	async searchAuthorFromChunk(text: string): Promise<string> {
		const session = await window.ai.assistant.create({temperature: 0, topK: 10});
		try {
			const result = await session.prompt(
				`In the following text, search for the author of the article, the author's name is generally outside of any sentence.
        Don't pick a random name in the text and ensure the name you find is correct.
        Only answer with the author's name or 'No author found' if no author is provided:
        ${text}`
			);
			console.log(`Answer: Author ${result.toLowerCase()}.`);
			return result.toLowerCase().trim();
		} catch (error) {
			console.error(`Failed to search author: ${error}`);
			return 'No author found';
		} finally {
			session.destroy();
		}
	}
	
	async searchAuthorFromLink(text: string): Promise<string> {
		const session = await window.ai.assistant.create({temperature: 0, topK: 1});
		try {
			const result = await session.prompt(
				`Extract to domain name from the given link, respond with the domain name only:
				${text}`
			);
			console.log(`Answer: Author from link ${result.toLowerCase()}.`);
			return result.toLowerCase().trim();
		} catch (error) {
			console.error(`Failed to search author: ${error}`);
			return 'No author found';
		} finally {
			session.destroy();
		}
	}

	async checkAuthorIsCorrect(text: string): Promise<boolean> {
		const session = await window.ai.assistant.create({temperature: 0, topK: 1});
		try {
			const result = await session.prompt(
				`You will be given a name. Your task is to check if the name if correct. Answer with 'YES' or 'NO'. 
				The name is: ${text}`
			);
			console.log(`Answer: Author check ${result.toLowerCase()}.`);
			return result.toLowerCase().trim() === 'yes';
		} catch (error) {
			console.error(`Failed to check author: ${error}`);
			return false;
		} finally {
			session.destroy();
		}
	}

	async searchDateFromChunk(text: string): Promise<string> {
		const session = await window.ai.assistant.create({temperature: 0, topK: 10});
		try {
			const result = await session.prompt(
				`In the following text, your task is to search for publication date. Only answer with the publication date or 'No date found' if no date is provided:
				${text}`
			);
			console.log(`Answer: Date ${result.toLowerCase()}.`);
			return result.toLowerCase().trim();
		} catch (error) {
			console.error(`Failed to search publication date: ${error}`);
			return 'No date found';
		} finally {
			session.destroy();
		}
	}

	async searchDateFromLink(text: string): Promise<string> {
		const session = await window.ai.assistant.create({temperature: 0, topK: 1});
		try {
			const result = await session.prompt(
				`You will be given a link. Your task is to extract the publication date from the given link. Only answer with the date, or 'No date found' if you don't know the publication date:
				${text}`
			);
			console.log(`Answer: Date from link ${result.toLowerCase()}.`);
			return result.toLowerCase().trim();
		} catch (error) {
			console.error(`Failed to search date: ${error}`);
			return 'No date found';
		} finally {
			session.destroy();
		}
	}

	async answerQuestion(text: string, articles: Article[]): Promise<Article[]> {
        try {
			const toReturn = new Set<Article>();
			for (const article of articles) {
				for(const chunk of this.splitterService.chunkTextBySentence(article.content, 1500)){
					const session = await window.ai.assistant.create();
					try{
						const result = await session.prompt(
							`With the text from the given context and only from the context, try to answer the question at the end.
							Never try to make up the answer, if no answer is available, only with 'NO'.
							If you find the answer in the context, write 'YES', otherwise write 'NO', nothing less and nothing more.
							You have to be 100% accurate or it may harm the user.
							Context:
							This article was written by ${article.author} on ${article.date}.
							${chunk}
	
							Question: ${text}
							Answer: `
						);
						console.log(result.toLowerCase().trim())
						if(result.toLowerCase().trim() !== 'no'){
							console.log(`Answer: Question ${text} in article ${chunk} => ${result.toLowerCase().trim()}`);
							toReturn.add(article)
						}	
					} catch(exception) {
						console.error(exception);
					} finally {
						session.destroy();
					}
				}
			}
			return Array.from(toReturn);
			
		} catch (error) {
			console.error(`Failed to generate answer: ${error}`);
			return [];
		}
    }
	
}
