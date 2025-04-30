import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SizeProductComponent } from './size-product.component';

describe('SizeProductComponent', () => {
  let component: SizeProductComponent;
  let fixture: ComponentFixture<SizeProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SizeProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SizeProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
