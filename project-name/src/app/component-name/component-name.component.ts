import { Component } from '@angular/core';
import { Router } from '@angular/router'

@Component({
  selector: 'app-component-name',
  templateUrl: './component-name.component.html',
  styleUrls: ['./component-name.component.css']
  // template:'gu gu ga ga' 
})
export class ComponentNameComponent {

  constructor(private router: Router) {}

  goToHome() {
    // Navigating to the 'home' route
    this.router.navigate(['/home']);
  }

  goToAbout() {
    // Navigating to the 'about' route
    this.router.navigate(['/about']);
  }
}

