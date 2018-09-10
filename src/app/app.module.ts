import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { Routing } from './app.routing';
import { CommonsModule } from './modules/commons.module';
import { InfoModule } from './modules/info.module';
import { MinifierModule } from './modules/minifier.module';
import { SvgParserService } from './services/svg-parser.service';
import { SvgWriterService } from './services/svg-writer.service';


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
