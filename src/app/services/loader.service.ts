import { HttpClient } from '@angular/common/http';
import TurndownService from 'turndown';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  constructor(private readonly http: HttpClient, private readonly turndownService: TurndownService) { }

  /**
   * Loads a website content from a given URL using angular HttpClient and returns the content as a markdown string using the turndown library.
   */
  async loadWebsiteContent(url: string): Promise<string> {
    return firstValueFrom(this.http.get(`${environment.loarderUrl}?url=${url}`, { responseType: 'text' }));
  }

}
