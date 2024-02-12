import { Inject, Injectable, InjectionToken, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { Subscription, filter } from 'rxjs';
import { OnAppInit } from './app-init.service';

@Injectable({ providedIn: 'root' })
export class UpdateService implements OnAppInit, OnDestroy {
  private readonly subscription = new Subscription();

  constructor(
    private readonly swUpdate: SwUpdate,
    private readonly snackBar: MatSnackBar,
    @Inject(LocationToken) private readonly location: Location,
  ) {}

  async onAppInit() {
    this.subscription.add(
      this.swUpdate.versionUpdates
        .pipe(
          filter(
            (event): event is VersionReadyEvent =>
              event.type === 'VERSION_READY',
          ),
        )
        .subscribe(() => this.notifyOnUpdate()),
    );

    this.subscription.add(
      this.swUpdate.unrecoverable.subscribe(() => this.notifyOnUpdateError()),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private notifyOnUpdate() {
    this.snackBar
      .open('New version available! Please reload the app.', 'refresh', {
        panelClass: 'action-icon',
      })
      .onAction()
      .subscribe(() => this.location.reload());
  }

  private notifyOnUpdateError() {
    this.snackBar
      .open('An error occurred while updating the app.', 'Reload')
      .onAction()
      .subscribe(() => this.location.reload());
  }
}

export const LocationToken = new InjectionToken<Location>('Location', {
  providedIn: 'root',
  factory: () => window.location,
});
