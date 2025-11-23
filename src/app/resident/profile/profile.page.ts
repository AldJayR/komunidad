import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonAvatar, 
  IonIcon, 
  IonButton,
  IonSpinner,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  person, 
  logOutOutline,
  mailOutline,
  locationOutline,
  personOutline,
  informationCircleOutline,
  chevronForwardOutline
} from 'ionicons/icons';
import { Auth, UserProfile } from '../../services/auth';
import { Barangay, BarangayData } from '../../services/barangay';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonAvatar, 
    IonIcon, 
    IonButton,
    IonSpinner
  ]
})
export class ProfilePage implements OnInit {
  private authService = inject(Auth);
  private barangayService = inject(Barangay);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private destroyRef = inject(DestroyRef);

  userProfile: UserProfile | null = null;
  barangayName: string = '';

  constructor() {
    addIcons({ 
      person, 
      logOutOutline,
      mailOutline,
      locationOutline,
      personOutline,
      informationCircleOutline,
      chevronForwardOutline
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.authService.userProfile$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(profile => {
        this.userProfile = profile;
        if (profile?.barangayId) {
          this.loadBarangayName(profile.barangayId);
        }
      });
  }

  loadBarangayName(barangayId: string) {
    this.barangayService.getBarangays()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((barangays: BarangayData[]) => {
        const barangay = barangays.find((b: BarangayData) => b.id === barangayId);
        if (barangay) {
          this.barangayName = barangay.name;
        }
      });
  }

  async showAccountInfo() {
    if (!this.userProfile) return;

    const accountType = this.userProfile.role === 'resident' ? 'Resident' : 'Official';
    
    const alert = await this.alertController.create({
      header: 'Account Information',
      message: `Email: ${this.userProfile.email}\n\nBarangay: ${this.barangayName}\n\nAccount Type: ${accountType}\n\nUser ID: ${this.userProfile.uid}`,
      buttons: ['OK'],
      cssClass: 'account-info-alert'
    });

    await alert.present();
  }

  async onLogout() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Logout',
          role: 'confirm',
          handler: () => {
            this.authService.logout()
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: () => {
                  this.router.navigate(['/auth/login']);
                },
                error: (error) => {
                  console.error('Logout error:', error);
                  this.router.navigate(['/auth/login']);
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }
}
