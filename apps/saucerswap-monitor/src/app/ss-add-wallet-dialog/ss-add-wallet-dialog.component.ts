import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SaucerSwapLPPService } from '../saucer-swap-lpp.service';

@Component({
  selector: 'sm-ss-add-wallet-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
  templateUrl: './ss-add-wallet-dialog.component.html',
  styleUrl: './ss-add-wallet-dialog.component.css',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SsAddWalletDialogComponent {
  isAdding = false;

  constructor(
    private readonly ssLPService: SaucerSwapLPPService,
    private readonly dialogRef: MatDialogRef<string>,
    private readonly snackBar: MatSnackBar,
  ) {}

  async addWallet(walletId: string) {
    if (!walletId || this.isAdding) {
      return;
    }

    this.isAdding = true;

    try {
      await this.ssLPService.monitorWallet(walletId);
      this.dialogRef.close(walletId);
    } catch (e) {
      console.error(`Failed to add a wallet ${walletId}:`, e);
      this.snackBar.open(
        `Something went wrong adding a wallet. Please try again later.`,
        'Dismiss',
        { duration: 5000 },
      );
    } finally {
      this.isAdding = false;
    }
  }
}
