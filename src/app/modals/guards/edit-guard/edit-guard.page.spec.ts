import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditGuardPage } from './edit-guard.page';

describe('EditGuardPage', () => {
  let component: EditGuardPage;
  let fixture: ComponentFixture<EditGuardPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), EditGuardPage]
}).compileComponents();

    fixture = TestBed.createComponent(EditGuardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
