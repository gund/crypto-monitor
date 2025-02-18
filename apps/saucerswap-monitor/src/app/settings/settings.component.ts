import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  take,
} from 'rxjs';
import { CheckingInterval, SettingsService } from './settings.service';

@Component({
  selector: 'sm-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  protected CheckingInterval = CheckingInterval;

  protected form = this.fb.record(
    { checkingInterval: this.settings.defaultCheckingInteval },
    { validators: [Validators.required] },
  );

  private readonly initialValues$ = combineLatest({
    checkingInterval: this.settings.checkingInteval$,
  }).pipe(debounceTime(0), take(1), takeUntilDestroyed());

  private checkingIntervalChanges$ = this.form.controls[
    'checkingInterval'
  ].valueChanges.pipe(
    distinctUntilChanged(),
    filter((v) => !!v),
    map(Number),
    takeUntilDestroyed(),
  );

  constructor(
    private readonly fb: FormBuilder,
    private readonly settings: SettingsService,
  ) {}

  ngOnInit(): void {
    this.initialValues$.subscribe((values) =>
      this.form.patchValue(values, { emitEvent: false }),
    );

    this.checkingIntervalChanges$.subscribe((v) =>
      this.settings.updateCheckingInterval(v),
    );
  }
}
