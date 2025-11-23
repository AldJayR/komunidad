import { TestBed } from '@angular/core/testing';

import { Barangay } from './barangay';

describe('Barangay', () => {
  let service: Barangay;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Barangay);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
