import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonSpinner,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { newspaperOutline, eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { Auth } from '../../services/auth';
import { ToastService } from '../../services/toast.service';
import { switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonLabel,
    IonInput,
    IonButton,
    IonText,
    IonSpinner,
    IonIcon,
    CommonModule, 
    FormsModule,
    RouterLink
  ]
})
export class LoginPage {
  private authService = inject(Auth);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor() {
    // Register icons
    addIcons({ newspaperOutline, eyeOutline, eyeOffOutline });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    if (!this.email || !this.password) {
      await this.toastService.warning('Please fill in all fields');
      return;
    }

    this.isLoading = true;

    this.authService.login(this.email, this.password).pipe(
      switchMap(user => this.authService.getUserProfile(user.uid)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: async (profile) => {
        await this.toastService.success('Login successful!');
        // Navigate based on role and clear history
        if (profile?.role === 'official') {
          this.router.navigate(['/official-dashboard'], { replaceUrl: true });
        } else {
          this.router.navigate(['/tabs/home'], { replaceUrl: true });
        }
        this.isLoading = false;
      },
      error: async (error) => {
        let message = 'Login failed';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          message = 'Invalid email or password';
        } else if (error.code === 'auth/invalid-email') {
          message = 'Invalid email format';
        } else if (error.code === 'auth/too-many-requests') {
          message = 'Too many attempts. Please try again later';
        } else if (error.message.includes('profile')) { // Generic error for profile issues
          message = 'Error loading user profile.';
        }
        await this.toastService.error(message);
        this.isLoading = false;
      }
    });
  }
}
