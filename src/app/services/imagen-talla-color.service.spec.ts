import { TestBed } from '@angular/core/testing';

import { ImagenTallaColorService } from './imagen-talla-color.service';

describe('ImagenTallaColorService', () => {
  let service: ImagenTallaColorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImagenTallaColorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
