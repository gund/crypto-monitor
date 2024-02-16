import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SsAddWalletDialogComponent } from './ss-add-wallet-dialog.component';

xdescribe('SsAddWalletDialogComponent', () => {
  let component: SsAddWalletDialogComponent;
  let fixture: ComponentFixture<SsAddWalletDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SsAddWalletDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SsAddWalletDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
