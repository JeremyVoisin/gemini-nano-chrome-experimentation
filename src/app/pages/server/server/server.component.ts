import { Component } from '@angular/core';
import { ArticlesListComponent } from "../../../components/articles-list/articles-list.component";
import { GeneratorService } from '../../../services/generator.service';
import { SUMMARIZER } from '../../../services/summarizer';
import { CloudSummarizerService } from '../../../services/cloud-summarizer.service';

@Component({
  selector: 'app-server',
  standalone: true,
  imports: [ArticlesListComponent],
  viewProviders: [
    {provide: SUMMARIZER, useClass: CloudSummarizerService},
    GeneratorService
  ],
  templateUrl: './server.component.html',
  styleUrl: './server.component.css'
})
export class ServerComponent {

}
