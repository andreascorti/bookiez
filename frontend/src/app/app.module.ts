import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef } from '@angular/core';
// import { RouterModule, PreloadAllModules } from '@angular/router';

import { ENV_PROVIDERS } from './environment';
import { ROUTES } from './app.routes';

import { AppComponent } from './app.component';

@NgModule({
    bootstrap: [AppComponent],
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        // RouterModule.forRoot(ROUTES)
    ],
    providers: [
        ENV_PROVIDERS
    ]
})
export class AppModule {
    constructor( public appRef: ApplicationRef) {}
}
