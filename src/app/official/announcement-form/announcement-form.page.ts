import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSelect,
  IonSelectOption,
  IonSpinner
} from '@ionic/angular/standalone';
import { Auth, UserProfile } from '../../services/auth';
import { Announcement, AnnouncementData } from '../../services/announcement';
import { ToastService } from '../../services/toast.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, filter, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-announcement-form',
  templateUrl: './announcement-form.page.html',
  styleUrls: ['./announcement-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonSelect,
    IonSelectOption,
    IonSpinner
  ]
})
export class AnnouncementFormPage implements OnInit {
  private authService = inject(Auth);
  private announcementService = inject(Announcement);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  announcementId: string | null = null;
  title = '';
  description = '';
  category = 'General';
  isLoading = false;
  isEditMode = false;
  userProfile: UserProfile | null = null;

  categories = [
    'General',
    'Event',
    'Emergency',
    'Community Service',
    'Health',
    'Education',
    'Infrastructure',
    'Safety'
  ];

  ngOnInit() {
    // Load user profile once
    this.authService.userProfile$.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((profile): profile is UserProfile => !!profile)
    ).subscribe(profile => {
      this.userProfile = profile;
    });

    // Load announcement if editing
    this.route.queryParams.pipe(
      takeUntilDestroyed(this.destroyRef),
      tap(params => {
        this.announcementId = params['id'];
        this.isEditMode = !!this.announcementId;
        this.isLoading = this.isEditMode;
      }),
      filter(params => !!params['id']),
      switchMap(params => this.announcementService.getAnnouncementById(params['id']))
    ).subscribe({
      next: (announcement) => {
        if (announcement) {
          this.title = announcement.title;
          this.description = announcement.description;
          this.category = announcement.category;
        }
        this.isLoading = false;
      },
      error: async () => {
        await this.toastService.error('Failed to load announcement');
        this.isLoading = false;
      }
    });
  }

  async onSubmit() {
    if (!this.title || !this.description || !this.category) {
      await this.toastService.warning('Please fill in all fields');
      return;
    }

    if (!this.userProfile) {
      await this.toastService.error('User profile not loaded');
      return;
    }

    this.isLoading = true;

    if (this.isEditMode && this.announcementId) {
      // Update existing announcement
      this.announcementService.updateAnnouncement(this.announcementId, {
        title: this.title,
        description: this.description,
        category: this.category
      }).subscribe({
        next: async () => {
          await this.toastService.success('Announcement updated');
          this.router.navigate(['/official-dashboard']);
          this.isLoading = false;
        },
        error: async () => {
          await this.toastService.error('Failed to update announcement');
          this.isLoading = false;
        }
      });
    } else {
      // Create new announcement
      this.announcementService.createAnnouncement({
        title: this.title,
        description: this.description,
        category: this.category,
        barangayId: this.userProfile.barangayId,
        authorId: this.userProfile.uid
      }).subscribe({
        next: async () => {
          await this.toastService.success('Announcement created');
          this.router.navigate(['/official-dashboard']);
          this.isLoading = false;
        },
        error: async () => {
          await this.toastService.error('Failed to create announcement');
          this.isLoading = false;
        }
      });
    }
  }
}
