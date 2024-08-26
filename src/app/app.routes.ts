import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home/home.component';
import { ServerComponent } from './pages/server/server/server.component';
import { WindowComponent } from './pages/window/window/window.component';
import { WelcomeComponent } from './pages/welcome/welcome.component';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'welcome' },
    { path: 'welcome', component: WelcomeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'server', component: ServerComponent},
    { path: 'window', component: WindowComponent},
    { path: '**', redirectTo: 'home' },
];
