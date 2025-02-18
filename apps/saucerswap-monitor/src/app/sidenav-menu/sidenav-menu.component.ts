import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListItem, MatNavList } from '@angular/material/list';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'sm-sidenav-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, MatNavList, MatListItem],
  templateUrl: './sidenav-menu.component.html',
  styleUrl: './sidenav-menu.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidenavMenuComponent {}
