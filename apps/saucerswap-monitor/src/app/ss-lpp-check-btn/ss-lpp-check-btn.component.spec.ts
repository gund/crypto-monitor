import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SsLppCheckBtnComponent } from './ss-lpp-check-btn.component';

xdescribe('SsLppCheckBtnComponent', () => {
  let component: SsLppCheckBtnComponent;
  let fixture: ComponentFixture<SsLppCheckBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SsLppCheckBtnComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SsLppCheckBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
