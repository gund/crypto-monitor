import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SsLppComponent } from './ss-lpp.component';

xdescribe('SsLppComponent', () => {
  let component: SsLppComponent;
  let fixture: ComponentFixture<SsLppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SsLppComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SsLppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
