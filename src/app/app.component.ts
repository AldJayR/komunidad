import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { Auth } from './services/auth';
import { take } from 'rxjs/operators';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  private authService = inject(Auth);
  private router = inject(Router);

  async ngOnInit() {
    // Initialize StatusBar
    try {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#3465A4' });
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch (error) {
      console.error('StatusBar error:', error);
    }

    // Small delay to ensure splash is visible
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check authentication state on app start
    this.authService.userProfile$.pipe(take(1)).subscribe(async profile => {
      if (profile) {
        // User is logged in, redirect to appropriate dashboard
        if (profile.role === 'official') {
          await this.router.navigate(['/official-dashboard'], { replaceUrl: true });
        } else {
          await this.router.navigate(['/tabs/home'], { replaceUrl: true });
        }
      }
      // If no profile, stay on login page (default route)
      
      // Hide splash screen after navigation
      setTimeout(async () => {
        await SplashScreen.hide();
      }, 100);
    });
  }
}
