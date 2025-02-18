import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { combineLatest } from 'rxjs';
import { some } from '../operators/array';
import { SWChannelService } from '../sw-channel.service';
import { ThenModule } from '../then.pipe';

@Component({
  selector: 'sm-ss-lpp-check-btn',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatTooltip,
    MatIconModule,
    ThenModule,
  ],
  templateUrl: './ss-lpp-check-btn.component.html',
  styleUrl: './ss-lpp-check-btn.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SsLppCheckBtnComponent {
  readonly isCheckingPositions$ = this.swChannelService.isCheckingPositions$;
  readonly isCheckScheduled$ = this.swChannelService.isCheckScheduled$;
  readonly isDisabled$ = combineLatest([
    this.isCheckingPositions$,
    this.isCheckScheduled$,
  ]).pipe(some(Boolean));

  constructor(private readonly swChannelService: SWChannelService) {}
}
