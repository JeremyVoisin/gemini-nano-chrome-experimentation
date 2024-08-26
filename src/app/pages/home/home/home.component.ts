import { Component } from '@angular/core';
import { SUMMARIZER, Summarizer } from "../../../services/summarizer";
import { ArticlesListComponent } from "../../../components/articles-list/articles-list.component";
import { SummarizerService } from '../../../services/summarizer.service';
import { GeneratorService } from '../../../services/generator.service';
import { CloudSummarizerService } from '../../../services/cloud-summarizer.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ArticlesListComponent],
  viewProviders: [
    {provide: SUMMARIZER, useClass: SummarizerService},
    GeneratorService
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
