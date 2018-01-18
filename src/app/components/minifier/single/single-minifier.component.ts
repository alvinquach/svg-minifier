import { Component, ElementRef, ViewChild } from "@angular/core";
import { MinifierService } from "../../../services/minifier.service";

@Component({
    selector: 'app-single-minifier',
    templateUrl: './single-minifier.component.html',
    // styleUrls: ['./single-minifier.component.scss']
})
export class SingleMinifierComponent {

    @ViewChild('fileInput') fileInput: ElementRef;

    @ViewChild('resultsContainer') resultsContainer: ElementRef;
    

    private _fileContents: string;

    private _results: string;

    constructor(private _minifierService: MinifierService) {

    }

    get fileContents(): string {
        return this._fileContents;
    }

    get results(): string {
        return this._results;
    }

    process() {
        let inputEl: HTMLInputElement = this.fileInput.nativeElement;
        let files: FileList = inputEl.files;
        if (files.length) {
            let reader: FileReader = new FileReader();
            reader.onload = (event: ProgressEvent) => {
                this._fileContents = (<FileReader>event.target).result;
                this._results = this._minifierService.minify(this.fileContents);
            }
            reader.readAsText(files[0]);
        }
    }

    copyToClipboard(): void {
        if (!this.resultsContainer) {
            return;
        }
        let range: Range = document.createRange();
        range.selectNode(this.resultsContainer.nativeElement);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand("copy");
    }

}