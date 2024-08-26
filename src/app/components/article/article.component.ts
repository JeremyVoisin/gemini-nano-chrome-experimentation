import { Component, effect, input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { Article } from '../../models/article';

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [MatExpansionModule],
  templateUrl: './article.component.html',
  styleUrl: './article.component.css'
})
export class ArticleComponent {
  article = input<Article>();

  constructor() {
    effect(() => {
      console.log('Article component initialized with:', this.article());
    })
  }

  get articleJson(): string {
    return JSON.stringify(this.article, null, 2);
  }
}
