import { TestBed } from '@angular/core/testing';

import { PedidoLocalServiceService } from './pedido-local-service.service';

describe('PedidoLocalServiceService', () => {
  let service: PedidoLocalServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PedidoLocalServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
