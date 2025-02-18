import { Component } from '@angular/core';
import { SsLppCheckBtnComponent } from '../ss-lpp-check-btn/ss-lpp-check-btn.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SaucerSwapMonitorService } from '../saucer-swap-monitor.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'sm-ss-lpp-actions',
  standalone: true,
  imports: [CommonModule, SsLppCheckBtnComponent],
  template: `<sm-ss-lpp-check-btn
    *ngIf="canTriggerCheck"
    (click)="triggerCheck()"
  ></sm-ss-lpp-check-btn>`,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class SsLppActionsComponent {
  readonly canTriggerCheck = !!this.ssMonitorService.triggerCheck;

  constructor(
    private readonly ssMonitorService: SaucerSwapMonitorService,
    private readonly snackBar: MatSnackBar,
  ) {}

  async triggerCheck() {
    if (!this.ssMonitorService.triggerCheck) {
      this.snackBar.open(`Triggering a check is not supported.`, 'Ok', {
        duration: 5000,
      });
      return;
    }

    try {
      await this.ssMonitorService.triggerCheck();
    } catch (e) {
      console.error('Failed to trigger check:', e);
      this.snackBar.open(
        `Something went wrong triggering a check. Please try again later.`,
        'Dismiss',
        { duration: 5000 },
      );
    }
  }
}
