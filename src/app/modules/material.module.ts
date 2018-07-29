import { NgModule } from "@angular/core";
import { MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatIconModule, MatMenuModule, MatSidenavModule } from "@angular/material";

const MaterialModules = [
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule
];

@NgModule({
    imports: MaterialModules,
    exports: MaterialModules
})
export class MaterialModule {}