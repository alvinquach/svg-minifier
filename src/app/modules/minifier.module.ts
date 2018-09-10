import { NgModule } from "@angular/core";
import { SingleMinifierComponent } from "../components/minifier/single/single-minifier.component";
import { DevFeatureService } from "../services/dev-feature.service";
import { MinifierService } from "../services/minifier.service";
import { CommonsModule } from "./commons.module";

@NgModule({
	imports: [
        CommonsModule
    ],
	declarations: [
		SingleMinifierComponent,
	],
    providers: [
        MinifierService,
        DevFeatureService
    ]
})
export class MinifierModule {}