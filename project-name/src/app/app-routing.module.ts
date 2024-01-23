import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComponentNameComponent } from './component-name/component-name.component';

const routes: Routes = [
  // { path: 'home/:code/:state', component: ComponentNameComponent },
  // { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'hi', component: ComponentNameComponent },
  // { path: 'about', component: AboutComponent },
  // Add more routes as needed
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
