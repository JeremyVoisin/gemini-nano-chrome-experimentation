import { InjectionToken } from "@angular/core";
import { Article } from "../models/article";

export interface Summarizer{
    initialize(): Promise<void>;
    summarize(text: string, link: string): Promise<Partial<Article>>;
    searchPublicationDate(text: string): Promise<string>;
    searchAuthor(text: string): Promise<string>;
    answerQuestion(text: string, articles: Article[]): Promise<Article[]>;
    name: string;
}

export const SUMMARIZER = new InjectionToken<Summarizer>('Summarizer');