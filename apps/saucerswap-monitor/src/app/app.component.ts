import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'sm-app',
  template: `<router-outlet></router-outlet>`,
  styles: [],
  encapsulation: ViewEncapsulation.Emulated,
})
export class AppComponent {}
