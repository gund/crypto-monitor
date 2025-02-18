import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Title } from '@angular/platform-browser';
import { EventType, Router, RouterModule } from '@angular/router';
import { debounceTime, filter, map, tap } from 'rxjs';
import {
  MatDrawer,
  MatDrawerContent,
  MatSidenavModule,
} from '@angular/material/sidenav';
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
  @ViewChild(MatDrawer, { static: true })
  protected readonly drawer?: MatDrawer;

  @ViewChild(MatDrawerContent, { static: true })
  protected readonly content?: MatDrawerContent;

  protected readonly title$ = this.router.events.pipe(
    filter((event) => event.type === EventType.NavigationEnd),
    debounceTime(0),
    map(() => this.title.getTitle()),
    tap(() => this.navEffect()),
  );

  constructor(private readonly title: Title, private readonly router: Router) {}

  private navEffect() {
    this.drawer?.close();
    this.content?.scrollTo({ start: 0, behavior: 'smooth' });
  }
}
