import { NgModule } from "@angular/core";
import { MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatSidenavModule, MatRadioModule, MatOptionModule } from "@angular/material";

const MaterialModules = [
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatRadioModule,
    MatSidenavModule
];

@NgModule({
    imports: MaterialModules,
    exports: MaterialModules
})
export class MaterialModule {}