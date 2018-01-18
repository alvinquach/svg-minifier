import { ModuleWithProviders } from "@angular/core";
import { Route, Routes, RouterModule } from "@angular/router";
import { SingleMinifierComponent } from "./components/minifier/single/single-minifier.component";
import { AboutComponent } from "./components/info/about/about.component";

const AppRoutes: Routes = [
    {
        path: '',
        redirectTo: 'upload',
        pathMatch: 'full'
    },
    {
        path: 'upload',
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