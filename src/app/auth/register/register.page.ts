import { Component, OnInit, inject, DestroyRef } from '@angular/core';
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
  IonSelect,
  IonSelectOption,
  IonRadioGroup,
  IonRadio,
  IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { newspaperOutline, eyeOutline, eyeOffOutline, arrowBackOutline } from 'ionicons/icons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Auth } from '../../services/auth';
import { Barangay, BarangayData } from '../../services/barangay';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
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
    IonSelect,
    IonSelectOption,
    IonRadioGroup,
    IonRadio,
    IonIcon,
    CommonModule,
    FormsModule,
    RouterLink
  ]
})
export class RegisterPage implements OnInit {
  private authService = inject(Auth);
  private barangayService = inject(Barangay);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  email = '';
  password = '';
  confirmPassword = '';
  role: 'resident' | 'official' = 'resident';
  barangayId = '';
  barangays: BarangayData[] = [];
  isLoading = false;
  isLoadingBarangays = true;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor() {
    // Register icons
    addIcons({ newspaperOutline, eyeOutline, eyeOffOutline, arrowBackOutline });
  }

  ngOnInit() {
    this.loadBarangays();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private loadBarangays() {
    this.barangayService.getBarangays().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (barangays) => {
        this.barangays = barangays;
        this.isLoadingBarangays = false;
      },
      error: async (error) => {
        await this.toastService.error('Failed to load barangays');
        this.isLoadingBarangays = false;
      }
    });
  }

  async onRegister() {
    // Validation
    if (!this.email || !this.password || !this.confirmPassword || !this.barangayId) {
      await this.toastService.warning('Please fill in all fields');
      return;
    }

    if (this.password !== this.confirmPassword) {
      await this.toastService.warning('Passwords do not match');
      return;
    }

    if (this.password.length < 6) {
      await this.toastService.warning('Password must be at least 6 characters');
      return;
    }

    this.isLoading = true;

    this.authService.register(this.email, this.password, this.role, this.barangayId).subscribe({
      next: async () => {
        await this.toastService.success('Registration successful!');
        // Navigate based on role and clear history
        if (this.role === 'official') {
          this.router.navigate(['/official-dashboard'], { replaceUrl: true });
        } else {
          this.router.navigate(['/home'], { replaceUrl: true });
        }
        this.isLoading = false;
      },
      error: async (error) => {
        let message = 'Registration failed';
        if (error.code === 'auth/email-already-in-use') {
          message = 'Email already in use';
        } else if (error.code === 'auth/invalid-email') {
          message = 'Invalid email format';
        } else if (error.code === 'auth/weak-password') {
          message = 'Password is too weak';
        }
        await this.toastService.error(message);
        this.isLoading = false;
      }
    });
  }
}
