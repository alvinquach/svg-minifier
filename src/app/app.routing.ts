import { ModuleWithProviders } from "@angular/core";
import { Route, Routes, RouterModule } from "@angular/router";
import { SingleMinifierComponent } from "./components/minifier/single/single-minifier.component";

const BaseRoute: Route = {
    path: '',
    redirectTo: 'minify',
    pathMatch: 'full'
}

const SingleMinifierRoute: Route = {
    path: 'minify',
    component: SingleMinifierComponent,
}

const AppRoutes: Routes = [
    BaseRoute,
    SingleMinifierRoute
];

export const Routing: ModuleWithProviders = RouterModule.forRoot(AppRoutes);