import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { 
  Firestore, 
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  orderBy
} from '@angular/fire/firestore';
import { Observable, from, map, defer, tap, catchError, of } from 'rxjs';

export interface BarangayData {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class Barangay {
  private firestore = inject(Firestore);
  private injector = inject(Injector);
  private readonly collectionName = 'barangays';
  private readonly documentId = 'barangay_names';
  private cachedBarangays: BarangayData[] | null = null;

  /**
   * Get all barangays from Firestore with caching
   */
  getBarangays(): Observable<BarangayData[]> {
    // Return cached data if available
    if (this.cachedBarangays) {
      return of(this.cachedBarangays);
    }

    return defer(() => 
      runInInjectionContext(this.injector, () => {
        const collectionRef = collection(this.firestore, this.collectionName);
        const q = query(collectionRef, orderBy('name', 'asc'));
        
        return from(getDocs(q)).pipe(
          map(querySnap => {
            if (querySnap.empty) {
              return [];
            }
            
            return querySnap.docs.map(doc => ({
              id: doc.id,
              name: doc.data()['name']
            }));
          }),
          tap(barangays => {
            // Cache the results
            this.cachedBarangays = barangays;
          }),
          catchError(error => {
            console.error('Error fetching barangays:', error);
            return of([]);
          })
        );
      })
    );
  }

  /**
   * Clear the cache (useful for testing or force refresh)
   */
  clearCache(): void {
    this.cachedBarangays = null;
  }

  /**
   * Get a single barangay by ID from cache
   */
  getBarangayById(id: string): Observable<BarangayData | null> {
    return this.getBarangays().pipe(
      map(barangays => barangays.find(b => b.id === id) || null)
    );
  }
}
