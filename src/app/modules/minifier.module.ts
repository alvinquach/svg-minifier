import { SingleMinifierComponent } from "../components/minifier/single/single-minifier.component";
import { MinifierService } from "../services/minifier.service";
import { NgModule } from "@angular/core";
import { CommonsModule } from "./commons.module";

@NgModule({
	imports: [
        CommonsModule
    ],
	declarations: [
		SingleMinifierComponent,
	],
    providers: [
        MinifierService
    ]
})
export class MinifierModule {}