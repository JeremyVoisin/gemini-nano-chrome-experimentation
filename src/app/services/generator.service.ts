import { Inject, Injectable } from '@angular/core';
import { LoaderService } from './loader.service';
import { ArticlesService } from './articles.service';
import { Summarizer, SUMMARIZER } from './summarizer';
import { Article } from '../models/article';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class GeneratorService {

  private filteredArticlesList: BehaviorSubject<Article[]> = new BehaviorSubject<Article[]>([]);
  private articlesList: BehaviorSubject<Article[]> = new BehaviorSubject<Article[]>([]);

  constructor(private readonly loaderService: LoaderService, @Inject(SUMMARIZER) private readonly summarizerService: Summarizer, private readonly articlesService: ArticlesService) {
    this.articlesService.getArticles().subscribe((articles) => this.articlesList.next(articles));
    this.articlesService.getArticles().subscribe((articles) => this.filteredArticlesList.next(articles));
  }

  get articles() {
    return this.filteredArticlesList.asObservable()
  }

  resetFilter() {
    this.filteredArticlesList.next(this.articlesList.value);
  }

  async generateArticle(link: string): Promise<void> {
    await this.summarizerService.initialize();
    console.log(`Loading article from ${link}`);
      const content = await this.loaderService.loadWebsiteContent(link);
      const summary = await this.summarizerService.summarize(content, link);
      console.log(`Summarized article: ${summary}`);
      await this.articlesService.addArticle({
        id: undefined,
        url: link,
        title: summary.title ?? 'Unknown',
        author: summary.author?? 'Unknown' ,
        date: summary.date ?? 'Unknown',
        summary: summary.summary ?? 'Unknown',
        content,
        origin: this.summarizerService.name
      })
  }
  
  async answerQuestion(question: string): Promise<Article[]> {
    await this.summarizerService.initialize();
    console.log(`Answering question: ${question} about ${this.articlesList.value.length} articles`);
    const response = await this.summarizerService.answerQuestion(question, this.articlesList.value);
    this.filteredArticlesList.next(response);
    return response;
  }
}
