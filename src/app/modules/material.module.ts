import { NgModule } from "@angular/core";
import { 
    MatButtonModule,
    MatFormFieldModule,
    MatSidenavModule,
    MatIconModule,
} from "@angular/material";

@NgModule({
    imports: [
        MatButtonModule,
        MatFormFieldModule,
        MatSidenavModule,
        MatIconModule,
    ],
    exports: [
        MatButtonModule,
        MatFormFieldModule,
        MatSidenavModule,
        MatIconModule,
    ]
})
export class MaterialModule {}