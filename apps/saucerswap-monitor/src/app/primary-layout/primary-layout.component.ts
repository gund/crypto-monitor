import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Title } from '@angular/platform-browser';
import { EventType, Router, RouterModule } from '@angular/router';
import { debounceTime, filter, map } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidenavMenuComponent } from '../sidenav-menu/sidenav-menu.component';

@Component({
  selector: 'sm-primary-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    SidenavMenuComponent,
  ],
  templateUrl: './primary-layout.component.html',
  styleUrl: './primary-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrimaryLayoutComponent {
  title$ = this.router.events.pipe(
    filter((event) => event.type === EventType.NavigationEnd),
    debounceTime(0),
    map(() => this.title.getTitle()),
  );

  constructor(private readonly title: Title, private readonly router: Router) {}
}
