import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  EventType,
  ResolveEnd,
  Router,
} from '@angular/router';
import { filter } from 'rxjs';
import { OnAppInit } from './app-init.service';

@Injectable({ providedIn: 'root' })
export class RouterSyncService implements OnAppInit {
  private readonly resolveEnd$ = this.router.events.pipe(
    filter((event): event is ResolveEnd => event.type === EventType.ResolveEnd),
  );

  constructor(private readonly router: Router) {}

  onAppInit(): void | Promise<void> {
    this.resolveEnd$.subscribe((event) =>
      this.syncToolbarActions(
        event.state.root.children.find((r) => r.outlet === 'primary'),
        event.state.root.children.find((r) => r.outlet === 'toolbarActions'),
      ),
    );
  }

  private syncToolbarActions(
    primary?: ActivatedRouteSnapshot,
    toolbarActions?: ActivatedRouteSnapshot,
  ) {
    if (!primary) {
      return;
    }

    const primaryPath = primary.routeConfig?.path;
    let path = primaryPath;

    if (toolbarActions) {
      if (
        primary.outlet === toolbarActions.outlet ||
        primary.toString() === toolbarActions.toString()
      ) {
        return;
      }

      const toolbarActionsPath = toolbarActions.routeConfig?.path;

      if (path === toolbarActionsPath) {
        return;
      }
    }

    if (
      !this.router.config.some(
        (route) => route.outlet === 'toolbarActions' && route.path === path,
      )
    ) {
      path = 'empty';
    }

    if (path === toolbarActions?.routeConfig?.path) {
      return;
    }

    this.router.navigate(
      [{ outlets: { primary: primaryPath, toolbarActions: path } }],
      { queryParamsHandling: 'preserve', preserveFragment: true },
    );
  }
}
