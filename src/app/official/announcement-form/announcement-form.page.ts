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
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { Auth, UserProfile } from '../../services/auth';
import { Announcement, AnnouncementData } from '../../services/announcement';
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
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonSpinner
  ]
})
export class AnnouncementFormPage implements OnInit {
  private authService = inject(Auth);
  private announcementService = inject(Announcement);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastController = inject(ToastController);
  private destroyRef = inject(DestroyRef);

  announcementId: string | null = null;
  title = '';
  description = '';
  category = 'General';
  isLoading = false;
  isEditMode = false;

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
        await this.showToast('Failed to load announcement', 'danger');
        this.isLoading = false;
      }
    });
  }

  async onSubmit() {
    if (!this.title || !this.description || !this.category) {
      await this.showToast('Please fill in all fields', 'warning');
      return;
    }

    this.isLoading = true;

    this.authService.userProfile$.pipe(
      takeUntilDestroyed(this.destroyRef),
      filter((profile): profile is UserProfile => !!profile),
      switchMap(profile => {
        if (this.isEditMode && this.announcementId) {
          // Update
          return this.announcementService.updateAnnouncement(this.announcementId, {
            title: this.title,
            description: this.description,
            category: this.category
          }).pipe(
            tap(() => this.showToast('Announcement updated', 'success'))
          );
        } else {
          // Create
          const newAnnouncement = {
            title: this.title,
            description: this.description,
            category: this.category,
            barangayId: profile.barangayId,
            authorId: profile.uid
          };
          return this.announcementService.createAnnouncement(newAnnouncement).pipe(
            tap(() => this.showToast('Announcement created', 'success'))
          );
        }
      })
    ).subscribe({
      next: () => {
        this.router.navigate(['/official-dashboard']);
        this.isLoading = false;
      },
      error: async (error) => {
        const action = this.isEditMode ? 'update' : 'create';
        await this.showToast(`Failed to ${action} announcement`, 'danger');
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
