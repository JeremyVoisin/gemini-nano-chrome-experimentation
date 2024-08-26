import { ApplicationConfig, InjectionToken, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import TurndownService from 'turndown';
import { initializeApp } from "firebase/app";
import { ArticlesDB } from './models/database';
import { environment } from '../environments/environment';

export const FIREBASE = new InjectionToken('firebase.config');


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    { provide: TurndownService, useValue: new TurndownService() },
    { provide: FIREBASE, useValue: initializeApp(environment.firebaseConfig) },
    { provide: ArticlesDB, useValue: new ArticlesDB()},
  ]
};
