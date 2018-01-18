import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { MinifierService } from './services/minifier.service';
import { SvgParserService } from './services/svg-parser.service';
import { SvgWriterService } from './services/svg-writer.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Routing } from './app.routing';
import { MaterialModule } from './modules/material.module';
import { MinifierModule } from './modules/minifier.module';
import { CommonsModule } from './modules/commons.module';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { InfoModule } from './modules/info.module';


@NgModule({
  imports: [
    Routing,
    CommonsModule,
    MinifierModule,
    InfoModule,
  ],
  declarations: [
    AppComponent,
  ],
  providers: [
    {provide: LocationStrategy, useClass: HashLocationStrategy},
    SvgParserService,
    SvgWriterService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
