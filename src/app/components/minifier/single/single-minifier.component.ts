import { Component, ElementRef, ViewChild, AfterViewInit, ChangeDetectorRef } from "@angular/core";
import { MinifierService } from "../../../services/minifier.service";
import { SvgOutputOptions } from "../../../classes/svg/options/svg-output-options.class";

@Component({
    selector: 'app-single-minifier',
    templateUrl: './single-minifier.component.html',
    styleUrls: ['./single-minifier.component.scss']
})
export class SingleMinifierComponent implements AfterViewInit {

    @ViewChild('fileInput') fileInput: ElementRef;

    @ViewChild('resultsContainer') resultsContainer: ElementRef;
    
    private _svgOutputOptions: SvgOutputOptions = new SvgOutputOptions();

    private _fileContents: string;

    private _results: string;

    private _inputEl: HTMLInputElement;

    constructor(private _cd: ChangeDetectorRef, private _minifierService: MinifierService) {

    }

    get svgOutputOptions(): SvgOutputOptions {
        return this._svgOutputOptions;
    }

    get fileContents(): string {
        return this._fileContents;
    }

    get results(): string {
        return this._results;
    }

    ngAfterViewInit(): void {
        this._inputEl = this.fileInput.nativeElement;
    }

    markForCheck() {
        this._cd.markForCheck();
    }

    clearOptions() {
        for (const key in this._svgOutputOptions) {
            this._svgOutputOptions[key] = false;
        }
    }

    gtSportOptionsPreset() {
        this._svgOutputOptions.minifyElementIds = true;
        this._svgOutputOptions.gtSportFixGradientTransform = true;
        this._svgOutputOptions.gtSportFixRadialGradients = true;
        this._svgOutputOptions.gtSportRemoveMiterLimits = true;
    }

    hasFiles(): boolean {
        return this._inputEl && !!this._inputEl.files.length;
    }

    process() {
        const files: FileList = this._inputEl.files;
        if (files.length) {
            const reader: FileReader = new FileReader();
            reader.onload = (event: ProgressEvent) => {
                this._fileContents = (<FileReader>event.target).result;
                this._results = this._minifierService.minify(this.fileContents, this._svgOutputOptions);
            }
            reader.readAsText(files[0]);
        }
    }

    copyToClipboard(): void {
        if (!this.resultsContainer) {
            return;
        }
        const range: Range = document.createRange();
        range.selectNode(this.resultsContainer.nativeElement);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand("copy");
    }

}