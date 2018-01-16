import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { MinifierService } from './services/minifier.service';
import { SvgParserService } from './services/svg-parser.service';
import { SvgWriterService } from './services/svg-writer.service';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    MinifierService,
    SvgParserService,
    SvgWriterService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
