import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltip } from '@angular/material/tooltip';
import { getLPPositionUrl } from '@crypto-monitor/saucer-swap-monitor';
import { map } from 'rxjs';
import { PositionsSummaryPipe } from '../positions-summary.pipe';
import { SaucerSwapLPPService } from '../saucer-swap-lpp.service';
import { SsAddWalletDialogComponent } from '../ss-add-wallet-dialog/ss-add-wallet-dialog.component';

@Component({
  selector: 'sm-ss-lpp',
  standalone: true,
  imports: [
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatButtonModule,
    MatTooltip,
    MatToolbarModule,
    MatExpansionModule,
    PositionsSummaryPipe,
  ],
  templateUrl: './ss-lpp.component.html',
  styleUrl: './ss-lpp.component.css',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SsLppComponent {
  wallets$ = this.ssLPService.getWallets();
  isOneWallet$ = this.wallets$.pipe(map((wallets) => wallets.length === 1));
  getLPPositionUrl = getLPPositionUrl;

  constructor(
    private readonly ssLPService: SaucerSwapLPPService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {}

  addWallet() {
    this.dialog.open(SsAddWalletDialogComponent);
  }

  async removeWallet(walletId: string) {
    try {
      await this.ssLPService.stopMonitoringWallet(walletId);
    } catch (e) {
      console.error(`Failed to remove wallet ${walletId}:`, e);
      this.snackBar.open(
        `Something went wrong removing a wallet. Please try again later.`,
        'Dismiss',
        { duration: 5000 },
      );
    }
  }
}
