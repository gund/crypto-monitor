import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'sm-sidenav-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule],
  templateUrl: './sidenav-menu.component.html',
  styleUrl: './sidenav-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavMenuComponent {}
