import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild, OnInit } from "@angular/core";
import { ActivatedRoute, UrlSegment } from "@angular/router";
import { SvgMinifyOptions } from "../../../classes/svg/options/svg-minify-options.class";
import { MinifierService } from "../../../services/minifier.service";

@Component({
    selector: 'app-single-minifier',
    templateUrl: './single-minifier.component.html',
    styleUrls: ['./single-minifier.component.scss']
})
export class SingleMinifierComponent implements OnInit, AfterViewInit {

    @ViewChild('fileInput') fileInput: ElementRef;

    @ViewChild('resultsContainer') resultsContainer: ElementRef;
    
    private _svgMinifyOptions: SvgMinifyOptions = new SvgMinifyOptions();

    private _fileContents: string;

    private _results: string;

    private _inputEl: HTMLInputElement;

    private _enableDevFeatures: boolean;

    constructor(private _cd: ChangeDetectorRef, 
                private _minifierService: MinifierService,
                private _activatedRoute: ActivatedRoute) {

    }

    get svgMinifyOptions(): SvgMinifyOptions {
        return this._svgMinifyOptions;
    }

    get fileContents(): string {
        return this._fileContents;
    }

    get results(): string {
        return this._results;
    }

    get enableDevFeatures(): boolean {
        return this._enableDevFeatures;
    }

    ngOnInit(): void {
        const urlSegments: UrlSegment[] = this._activatedRoute.snapshot.url;
        const lastSegment: string = urlSegments[urlSegments.length - 1].path;
        this._enableDevFeatures = lastSegment === 'dev';
    }

    ngAfterViewInit(): void {
        this._inputEl = this.fileInput.nativeElement;
    }

    markForCheck() {
        this._cd.markForCheck();
    }

    clearOptions() {
        for (const key in this._svgMinifyOptions) {
            this._svgMinifyOptions[key] = false;
        }
    }

    gtSportOptionsPreset() {
        this._svgMinifyOptions.minifyElementIds = true;
        this._svgMinifyOptions.gtSportFixGradientTransform = true;
        this._svgMinifyOptions.gtSportFixRadialGradients = true;
        this._svgMinifyOptions.gtSportRemoveMiterLimits = true;
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
                this._results = this._minifierService.minify(this.fileContents, this._svgMinifyOptions);
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