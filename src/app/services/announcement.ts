import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  Timestamp,
  DocumentData
} from '@angular/fire/firestore';
import { Storage } from '@ionic/storage-angular';
import { Observable, from, map, tap, catchError, of, defer } from 'rxjs';

export interface AnnouncementData {
  id?: string;
  title: string;
  description: string;
  category: string;
  barangayId: string;
  authorId: string;
  datePosted: Date;
}

@Injectable({
  providedIn: 'root',
})
export class Announcement {
  private firestore = inject(Firestore);
  private storage = inject(Storage);
  private injector = inject(Injector);
  private readonly collectionName = 'announcements';
  private readonly cacheKey = 'cached_announcements';
  private storageInitialized = false;

  constructor() {
    this.initStorage();
  }

  /**
   * Initialize Ionic Storage
   */
  private async initStorage(): Promise<void> {
    if (!this.storageInitialized) {
      await this.storage.create();
      this.storageInitialized = true;
    }
  }

  /**
   * Get announcements for a specific barangay (for Residents)
   */
  getAnnouncements(barangayId: string): Observable<AnnouncementData[]> {
    return defer(() => {
      return runInInjectionContext(this.injector, () => {
        const announcementsRef = collection(this.firestore, this.collectionName);
        const q = query(
          announcementsRef, 
          where('barangayId', '==', barangayId),
          orderBy('datePosted', 'desc')
        );

        return from(getDocs(q)).pipe(
          map(snapshot => this.mapDocsToAnnouncements(snapshot.docs)),
          tap(announcements => this.cacheAnnouncements(announcements)),
          catchError(() => this.getCachedAnnouncements())
        );
      });
    });
  }

  /**
   * Get all announcements across all barangays (for Advanced Search)
   */
  getAllAnnouncements(): Observable<AnnouncementData[]> {
    return defer(() => {
      return runInInjectionContext(this.injector, () => {
        const announcementsRef = collection(this.firestore, this.collectionName);
        const q = query(
          announcementsRef,
          orderBy('datePosted', 'desc')
        );

        return from(getDocs(q)).pipe(
          map(snapshot => this.mapDocsToAnnouncements(snapshot.docs))
        );
      });
    });
  }

  /**
   * Get announcements created by a specific official
   */
  getMyAnnouncements(officialId: string): Observable<AnnouncementData[]> {
    return defer(() => {
      return runInInjectionContext(this.injector, () => {
        const announcementsRef = collection(this.firestore, this.collectionName);
        const q = query(
          announcementsRef,
          where('authorId', '==', officialId),
          orderBy('datePosted', 'desc')
        );

        return from(getDocs(q)).pipe(
          map(snapshot => this.mapDocsToAnnouncements(snapshot.docs))
        );
      });
    });
  }

  /**
   * Get a single announcement by its ID
   */
  getAnnouncementById(id: string): Observable<AnnouncementData | null> {
    return defer(() => {
      return runInInjectionContext(this.injector, () => {
        const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
        return from(getDoc(docRef)).pipe(
          map(docSnap => {
            if (!docSnap.exists()) {
              return null;
            }
            return this.mapDocToAnnouncement(docSnap);
          })
        );
      });
    });
  }

  /**
   * Create new announcement
   */
  createAnnouncement(announcement: Omit<AnnouncementData, 'id' | 'datePosted'>): Observable<string> {
    const announcementsRef = collection(this.firestore, this.collectionName);
    const data = {
      ...announcement,
      datePosted: Timestamp.now()
    };

    return from(addDoc(announcementsRef, data)).pipe(
      map(docRef => docRef.id)
    );
  }

  /**
   * Update existing announcement
   */
  updateAnnouncement(
    id: string, 
    updates: Partial<Omit<AnnouncementData, 'id' | 'datePosted' | 'authorId' | 'barangayId'>>
  ): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return from(updateDoc(docRef, { ...updates }));
  }

  /**
   * Delete announcement
   */
  deleteAnnouncement(id: string): Observable<void> {
    const docRef = doc(this.firestore, `${this.collectionName}/${id}`);
    return from(deleteDoc(docRef));
  }

  /**
   * Cache announcements to local storage
   */
  private async cacheAnnouncements(announcements: AnnouncementData[]): Promise<void> {
    await this.initStorage();
    await this.storage.set(this.cacheKey, announcements);
  }

  /**
   * Get cached announcements from local storage
   */
  private getCachedAnnouncements(): Observable<AnnouncementData[]> {
    return from(
      this.initStorage().then(() => this.storage.get(this.cacheKey))
    ).pipe(
      map(cached => cached || [])
    );
  }

  /**
   * Map Firestore documents to Announcement objects
   */
  private mapDocsToAnnouncements(docs: import("@angular/fire/firestore").QueryDocumentSnapshot<DocumentData>[]): AnnouncementData[] {
    return docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data['title'],
        description: data['description'],
        category: data['category'],
        barangayId: data['barangayId'],
        authorId: data['authorId'],
        datePosted: (data['datePosted'] as Timestamp).toDate()
      };
    });
  }

  /**
   * Map a single Firestore document to an Announcement object
   */
  private mapDocToAnnouncement(doc: import("@angular/fire/firestore").DocumentSnapshot<DocumentData>): AnnouncementData {
    const data = doc.data()!;
    return {
      id: doc.id,
      title: data['title'],
      description: data['description'],
      category: data['category'],
      barangayId: data['barangayId'],
      authorId: data['authorId'],
      datePosted: (data['datePosted'] as Timestamp).toDate()
    };
  }
}
