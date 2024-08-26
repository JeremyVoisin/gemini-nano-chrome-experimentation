import {
	Component,
	effect,
	signal,
	Signal,
	WritableSignal,
} from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ArticleComponent } from '../article/article.component';
import { Article } from '../../models/article';
import { ArticlesService } from '../../services/articles.service';
import { GeneratorService } from '../../services/generator.service';

@Component({
	selector: 'app-articles-list',
	standalone: true,
	imports: [
		MatExpansionModule,
		MatButtonModule,
		MatDividerModule,
		MatIconModule,
		MatInputModule,
		MatFormFieldModule,
		MatInputModule,
		FormsModule,
    MatProgressSpinnerModule,
		ArticleComponent
	],
	templateUrl: './articles-list.component.html',
	styleUrl: './articles-list.component.css',
})
export class ArticlesListComponent {
	protected articles: WritableSignal<Article[]> = signal<Article[]>([]);
	protected generating: WritableSignal<boolean> = signal(false);
	protected link: string = '';

	constructor(
		private readonly generatorService: GeneratorService
	) {
		effect(() => {
			this.generatorService
				.articles
				.subscribe((articles) => this.articles.set(articles));
		}, {allowSignalWrites: true});
	}

  get isLink(): boolean {
    return /^(?:https?|http):\/\/[^\s]+/i.test(this.link) && this.link.length > 0;
  }
  
  get linkNotEmpty(): boolean {
    return this.link.length > 0;
  }

  resetFilter() {
    this.generatorService.resetFilter();
  }

	async summarizeArticle() {
		this.generating.set(true);
		await this.generatorService.generateArticle(this.link);
		this.generating.set(false);
    this.link = '';
	}

  async askQuestion() {
		this.generating.set(true);
		console.log(await this.generatorService.answerQuestion(this.link));
		this.generating.set(false);
    this.link = '';
	}
}
