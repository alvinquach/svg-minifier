import { NgModule } from "@angular/core";
import { 
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSidenavModule,
    MatIconModule,
} from "@angular/material";

@NgModule({
    imports: [
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatSidenavModule,
        MatIconModule,
    ],
    exports: [
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatSidenavModule,
        MatIconModule,
    ]
})
export class MaterialModule {}