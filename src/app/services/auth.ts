import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { 
  Auth as FirebaseAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User,
  authState
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc,
  DocumentData 
} from '@angular/fire/firestore';
import { Observable, from, map, switchMap, of, defer } from 'rxjs';

export interface UserProfile {
  uid: string;
  email: string;
  role: 'resident' | 'official';
  barangayId: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private auth = inject(FirebaseAuth);
  private firestore = inject(Firestore);
  private injector = inject(Injector);

  // Observable of current auth state
  readonly authState$ = authState(this.auth);

  // Observable of current user profile with Firestore data
  readonly userProfile$: Observable<UserProfile | null> = this.authState$.pipe(
    switchMap(user => user ? this.getUserProfile(user.uid) : of(null))
  );

  /**
   * Login with email and password
   */
  login(email: string, password: string): Observable<User> {
    return from(
      signInWithEmailAndPassword(this.auth, email, password)
    ).pipe(
      map(credential => credential.user)
    );
  }

  /**
   * Register new user with profile data
   */
  register(
    email: string, 
    password: string, 
    role: 'resident' | 'official', 
    barangayId: string
  ): Observable<User> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
    ).pipe(
      switchMap(credential => {
        const userProfile: Omit<UserProfile, 'uid'> = {
          email: credential.user.email!,
          role,
          barangayId
        };
        return from(
          setDoc(doc(this.firestore, `users/${credential.user.uid}`), userProfile)
        ).pipe(
          map(() => credential.user)
        );
      })
    );
  }

  /**
   * Logout current user
   */
  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  /**
   * Get user profile from Firestore
   */
  getUserProfile(uid: string): Observable<UserProfile | null> {
    return defer(() => {
      return runInInjectionContext(this.injector, () => {
        return from(
          getDoc(doc(this.firestore, `users/${uid}`))
        ).pipe(
          map(docSnap => {
            if (!docSnap.exists()) {
              return null;
            }
            const data = docSnap.data() as DocumentData;
            return {
              uid,
              email: data['email'],
              role: data['role'],
              barangayId: data['barangayId']
            } as UserProfile;
          })
        );
      });
    });
  }

  /**
   * Get current user (synchronous)
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
}
