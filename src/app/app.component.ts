import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Auth } from './services/auth';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  private authService = inject(Auth);
  private router = inject(Router);

  ngOnInit() {
    // Check authentication state on app start
    this.authService.userProfile$.pipe(take(1)).subscribe(profile => {
      if (profile) {
        // User is logged in, redirect to appropriate dashboard
        if (profile.role === 'official') {
          this.router.navigate(['/official-dashboard'], { replaceUrl: true });
        } else {
          this.router.navigate(['/tabs/home'], { replaceUrl: true });
        }
      }
      // If no profile, stay on login page (default route)
    });
  }
}
