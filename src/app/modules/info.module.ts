import { NgModule } from "@angular/core";
import { CommonsModule } from "./commons.module";
import { AboutComponent } from "../components/info/about/about.component";

@NgModule({
	imports: [
        CommonsModule
    ],
	declarations: [
		AboutComponent,
	],
    providers: []
})
export class InfoModule {}