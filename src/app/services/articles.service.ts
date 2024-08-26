import { Injectable } from '@angular/core';
import { ArticlesDB } from '../models/database';
import { liveQuery } from 'dexie';
import { Observable } from 'rxjs';
import { Article } from '../models/article';

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {

  constructor(private readonly articlesDatabase: ArticlesDB) {}

  public getArticles() {
    return liveQuery(() => this.articlesDatabase.articles.toArray());
  }

  public async addArticle(article: Article) {
    await this.articlesDatabase.articles.add(article);
  }

  public async deleteArticle(id: number) {
    await this.articlesDatabase.articles.delete(id);
  }

  public async updateArticle(id: number, article: Article) {
    await this.articlesDatabase.articles.update(id, article);
  }

  public async getArticle(id: number) {
    return await this.articlesDatabase.articles.get(id);
  }
}
