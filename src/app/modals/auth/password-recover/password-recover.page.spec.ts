import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PasswordRecoverPage } from './password-recover.page';

describe('PasswordRecoverPage', () => {
  let component: PasswordRecoverPage;
  let fixture: ComponentFixture<PasswordRecoverPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), PasswordRecoverPage]
}).compileComponents();

    fixture = TestBed.createComponent(PasswordRecoverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
