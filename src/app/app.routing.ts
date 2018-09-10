import { ModuleWithProviders } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AboutComponent } from "./components/info/about/about.component";
import { SingleMinifierComponent } from "./components/minifier/single/single-minifier.component";

const AppRoutes: Routes = [
    {
        path: '',
        redirectTo: 'minify',
        pathMatch: 'full'
    },
    {
        path: 'minify',
        component: SingleMinifierComponent,
    },
    {
        path: 'minify/dev',
        component: SingleMinifierComponent,
    },
    {
        path: 'info',
        children: [
            {
                path: '',
                redirectTo: 'about',
                pathMatch: 'full'
            },
            {
                path: 'about',
                component: AboutComponent
            }
        ]
    }
];

export const Routing: ModuleWithProviders = RouterModule.forRoot(AppRoutes);