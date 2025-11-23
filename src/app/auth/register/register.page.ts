import { Component, OnInit, inject } from '@angular/core';
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
  IonAvatar,
  IonIcon,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { newspaperOutline, eyeOutline, eyeOffOutline, arrowBackOutline } from 'ionicons/icons';
import { Auth } from '../../services/auth';
import { Barangay, BarangayData } from '../../services/barangay';

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
    IonAvatar,
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
  private toastController = inject(ToastController);

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
    this.barangayService.getBarangays().subscribe({
      next: (barangays) => {
        console.log('Barangays loaded:', barangays);
        this.barangays = barangays;
        this.isLoadingBarangays = false;
      },
      error: async (error) => {
        console.error('Error loading barangays:', error);
        await this.showToast('Failed to load barangays', 'danger');
        this.isLoadingBarangays = false;
      }
    });
  }

  async onRegister() {
    // Validation
    if (!this.email || !this.password || !this.confirmPassword || !this.barangayId) {
      await this.showToast('Please fill in all fields', 'warning');
      return;
    }

    if (this.password !== this.confirmPassword) {
      await this.showToast('Passwords do not match', 'warning');
      return;
    }

    if (this.password.length < 6) {
      await this.showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    this.isLoading = true;

    this.authService.register(this.email, this.password, this.role, this.barangayId).subscribe({
      next: async () => {
        await this.showToast('Registration successful!', 'success');
        // Navigate based on role
        if (this.role === 'official') {
          this.router.navigate(['/official-dashboard']);
        } else {
          this.router.navigate(['/home']);
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
        await this.showToast(message, 'danger');
        this.isLoading = false;
      }
    });
  }

  private async showToast(message: string, color: 'success' | 'warning' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }
}
