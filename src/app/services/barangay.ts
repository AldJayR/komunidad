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
import { Observable, from, map, defer } from 'rxjs';

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

  /**
   * Get all barangays from the names array
   */
  getBarangays(): Observable<BarangayData[]> {
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
          })
        );
      })
    );
  }
}
