import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NavbarBackComponent } from './navbar-back.component';

describe('NavbarBackComponent', () => {
  let component: NavbarBackComponent;
  let fixture: ComponentFixture<NavbarBackComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), NavbarBackComponent]
}).compileComponents();

    fixture = TestBed.createComponent(NavbarBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
