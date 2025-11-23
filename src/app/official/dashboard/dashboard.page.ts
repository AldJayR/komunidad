import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonFab,
  IonFabButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonButton,
  IonSpinner,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline, logOutOutline, refreshOutline, warning, megaphoneOutline } from 'ionicons/icons';
import { Auth, UserProfile } from '../../services/auth';
import { Announcement, AnnouncementData } from '../../services/announcement';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonFab,
    IonFabButton,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBadge,
    IonButton,
    IonSpinner
  ]
})
export class DashboardPage implements OnInit {
  private authService = inject(Auth);
  private announcementService = inject(Announcement);
  private router = inject(Router);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private destroyRef = inject(DestroyRef);

  announcements: AnnouncementData[] = [];
  userProfile: UserProfile | null = null;
  isLoading = true;

  constructor() {
    addIcons({ addOutline, createOutline, trashOutline, logOutOutline, refreshOutline, warning, megaphoneOutline });
  }

  ngOnInit() {
    this.authService.userProfile$.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((profile): profile is UserProfile => {
        if (!profile) {
          this.router.navigate(['/auth/login']);
          return false;
        }
        if (profile.role !== 'official') {
          this.router.navigate(['/home']);
          return false;
        }
        return true;
      }),
      tap(profile => {
        this.userProfile = profile;
        this.isLoading = true;
      }),
      switchMap(() => this.loadAnnouncements())
    ).subscribe({
      next: (announcements) => {
        this.announcements = announcements;
        this.isLoading = false;
      },
      error: async (error) => {
        await this.showToast('Failed to load announcements', 'danger');
        this.isLoading = false;
      }
    });
  }

  loadAnnouncements(): Observable<AnnouncementData[]> {
    if (!this.userProfile) {
      return new Observable(subscriber => subscriber.next([]));
    }
    return this.announcementService.getMyAnnouncements(this.userProfile.uid);
  }

  onCreateNew() {
    this.router.navigate(['/announcement-form']);
  }

  onEdit(announcement: AnnouncementData) {
    this.router.navigate(['/announcement-form'], {
      queryParams: { id: announcement.id }
    });
  }

  async onDelete(announcement: AnnouncementData) {
    const alert = await this.alertController.create({
      header: 'Delete Announcement',
      message: `Are you sure you want to delete "${announcement.title}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            if (announcement.id) {
              this.announcementService.deleteAnnouncement(announcement.id).pipe(
                takeUntilDestroyed(this.destroyRef)
              ).subscribe({
                next: async () => {
                  await this.showToast('Announcement deleted', 'success');
                  // Optimistically remove the announcement from the array
                  this.announcements = this.announcements.filter(a => a.id !== announcement.id);
                },
                error: async () => {
                  await this.showToast('Failed to delete announcement', 'danger');
                }
              });
            }
          }
        }
      ]
    });
    await alert.present();
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getCategoryCount(category: string): number {
    return this.announcements.filter(a => a.category === category).length;
  }

  getRecentCount(): number {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return this.announcements.filter(a => new Date(a.datePosted) >= oneWeekAgo).length;
  }

  onRefresh() {
    this.isLoading = true;
    this.loadAnnouncements().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (announcements) => {
        this.announcements = announcements;
        this.isLoading = false;
        this.showToast('Announcements refreshed', 'success');
      },
      error: () => {
        this.isLoading = false;
        this.showToast('Failed to refresh', 'danger');
      }
    });
  }

  async onLogout() {
    const alert = await this.alertController.create({
      header: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Logout',
          handler: () => {
            this.authService.logout().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
              next: () => {
                this.router.navigate(['/auth/login']);
              }
            });
          }
        }
      ]
    });
    await alert.present();
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
