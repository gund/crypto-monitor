import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { combineLatest, distinctUntilChanged, filter, map, take } from 'rxjs';
import { UntilDestroyed } from '../operators/until-destroyed';
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
  providers: [UntilDestroyed],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent implements OnInit {
  protected readonly CheckingInterval = CheckingInterval;

  protected readonly form = this.fb.record(
    { checkingInterval: this.settings.defaultCheckingInteval },
    { validators: [Validators.required] },
  );

  private readonly initialValues$ = combineLatest({
    checkingInterval: this.settings.checkingInteval$,
  }).pipe(take(1));

  private readonly checkingIntervalChanges$ = this.form.controls[
    'checkingInterval'
  ].valueChanges.pipe(
    distinctUntilChanged(),
    filter((v) => !!v),
    map(Number),
  );

  constructor(
    private readonly fb: FormBuilder,
    private readonly settings: SettingsService,
    private readonly ud: UntilDestroyed,
  ) {}

  ngOnInit(): void {
    this.initialValues$
      .pipe(this.ud.untilDestroyed())
      .subscribe((values) =>
        this.form.patchValue(values, { emitEvent: false }),
      );

    this.checkingIntervalChanges$
      .pipe(this.ud.untilDestroyed())
      .subscribe((v) => this.settings.updateCheckingInterval(v));
  }
}
