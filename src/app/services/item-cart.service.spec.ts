import { TestBed } from '@angular/core/testing';

import { ItemCartService } from './item-cart.service';

describe('ItemCartService', () => {
  let service: ItemCartService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemCartService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
