import { Component, ViewChild, ElementRef } from '@angular/core';
import { MinifierService } from './services/minifier/minifier.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    
    @ViewChild('fileInput') el: ElementRef;

    private _fileContents: string;

    private _processedContents: string;

    constructor(private _minifierService: MinifierService) {

    }

    get fileContents(): string {
        return this._fileContents;
    }

    get processedContents(): string {
        return this._processedContents;
    }
    
    process() {
        let inputEl: HTMLInputElement = this.el.nativeElement;
        let files: FileList = inputEl.files;
        if (files.length) {
            let reader: FileReader = new FileReader();
            reader.onload = (event: ProgressEvent) => {
                this._fileContents = (<FileReader>event.target).result;
                this._processedContents = this._minifierService.minify(this.fileContents);
            }
            reader.readAsText(files[0]);
        }
    }

}
