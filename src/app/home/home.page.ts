import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonBadge,
  IonSpinner,
  IonButton,
  IonIcon,
  IonSearchbar,
  IonChip,
  IonLabel,
  ToastController,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logOutOutline, refreshOutline, warning } from 'ionicons/icons';
import { Auth, UserProfile } from '../services/auth';
import { Announcement, AnnouncementData } from '../services/announcement';
import { Barangay, BarangayData } from '../services/barangay';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, switchMap, tap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonBadge,
    IonSpinner,
    IonButton,
    IonIcon,
    IonSearchbar,
    IonChip,
    IonLabel
  ],
})
export class HomePage implements OnInit {
  private authService = inject(Auth);
  private announcementService = inject(Announcement);
  private barangayService = inject(Barangay);
  private router = inject(Router);
  private toastController = inject(ToastController);
  private alertController = inject(AlertController);
  private destroyRef = inject(DestroyRef);

  announcements: AnnouncementData[] = [];
  filteredAnnouncements: AnnouncementData[] = [];
  userProfile: UserProfile | null = null;
  barangayName: string = '';
  searchQuery: string = '';
  selectedCategory: string = 'All';
  searchFocused: boolean = false;
  isLoading = true;
  selectedAnnouncement: AnnouncementData | null = null;
  
  private searchSubject = new Subject<string>();

  constructor() {
    addIcons({ logOutOutline, refreshOutline, warning });
    
    // Setup debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  ngOnInit() {
    this.authService.userProfile$.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((profile): profile is UserProfile => {
        if (profile === null) {
          this.router.navigate(['/auth/login']);
          return false;
        }
        return true;
      }),
      tap(profile => {
        this.userProfile = profile;
        this.isLoading = true;
        this.loadBarangayName(profile.barangayId);
      }),
      switchMap(profile => this.loadAnnouncements())
    ).subscribe({
      next: (announcements) => {
        this.announcements = announcements;
        this.applyFilters();
        this.isLoading = false;
      },
      error: async (error) => {
        await this.showToast('Failed to load announcements', 'danger');
        this.isLoading = false;
      }
    });
  }

  loadBarangayName(barangayId: string) {
    this.barangayService.getBarangays().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (barangays) => {
        const barangay = barangays.find(b => b.id === barangayId);
        this.barangayName = barangay ? barangay.name : '';
      },
      error: () => {
        this.barangayName = '';
      }
    });
  }

  loadAnnouncements(): Observable<AnnouncementData[]> {
    if (!this.userProfile?.barangayId) {
      return new Observable(subscriber => subscriber.next([]));
    }
    return this.announcementService.getAnnouncements(this.userProfile.barangayId);
  }

  onRefresh(event: any) {
    this.loadAnnouncements().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (announcements) => {
        this.announcements = announcements;
        this.applyFilters();
        event.target.complete();
      },
      error: () => {
        event.target.complete();
      }
    });
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  onSearchInput(event: any) {
    const query = event.target.value || '';
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  applyFilters() {
    let filtered = [...this.announcements];

    // Filter by category
    if (this.selectedCategory !== 'All') {
      filtered = filtered.filter(announcement => 
        announcement.category === this.selectedCategory
      );
    }

    // Filter by search query
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(announcement =>
        announcement.title.toLowerCase().includes(query) ||
        announcement.description.toLowerCase().includes(query)
      );
    }

    this.filteredAnnouncements = filtered;
  }

  async viewDetails(announcement: AnnouncementData) {
    if (announcement.id) {
      this.router.navigate(['/announcement', announcement.id]);
    }
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getRelativeDate(date: Date): string {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    // Check if it's today
    const isToday = now.toDateString() === postDate.toDateString();
    if (isToday) {
      return 'Today';
    }

    // Check if it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = yesterday.toDateString() === postDate.toDateString();
    if (isYesterday) {
      return 'Yesterday';
    }

    // Less than a week
    if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    }

    // Less than a month
    if (diffWeeks < 4) {
      return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
    }

    // Less than a year
    if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
    }

    // Years
    return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
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
