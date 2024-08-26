import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SplitterService {
  constructor() {}

  private splitIntoSentences(text: string): string[] {
    return text.match(/[^.!?]+[.!?]+/g) || [];
  }

  chunkTextBySentence(text: string, maxChunkSize: number) {
    const sentences = this.splitIntoSentences(text);
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxChunkSize) {
        currentChunk += sentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }
        currentChunk = sentence;
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }
}
