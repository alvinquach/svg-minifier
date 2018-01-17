import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routing } from '../app.routing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MinifierModule } from './minifier.module';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    FlexLayoutModule
  ],
  exports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    FlexLayoutModule
  ]
})
export class CommonsModule {}
