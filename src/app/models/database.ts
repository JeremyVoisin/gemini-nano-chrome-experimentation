import Dexie, { Table } from 'dexie';
import { Article } from './article';

export class ArticlesDB extends Dexie {
	articles!: Table<Article, number>;

	constructor() {
		super('ngdexieliveQuery');
		this.version(1).stores({
			articles: '++id',
		});
	}
}
