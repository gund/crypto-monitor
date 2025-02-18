import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PrimaryLayoutComponent } from './primary-layout/primary-layout.component';

@Component({
  standalone: true,
  imports: [PrimaryLayoutComponent],
  selector: 'sm-app',
  template: `<sm-primary-layout></sm-primary-layout>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
