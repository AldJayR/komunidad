import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline, warning } from 'ionicons/icons';
import { Announcement, AnnouncementData } from '../../services/announcement';

@Component({
  selector: 'app-announcement-detail',
  templateUrl: './announcement-detail.page.html',
  styleUrls: ['./announcement-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonSpinner
  ]
})
export class AnnouncementDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private announcementService = inject(Announcement);
  private destroyRef = inject(DestroyRef);

  announcement: AnnouncementData | null = null;

  constructor() {
    addIcons({ arrowBackOutline, warning });
  }

  ngOnInit() {
    const announcementId = this.route.snapshot.paramMap.get('id');
    if (announcementId) {
      this.loadAnnouncement(announcementId);
    }
  }

  loadAnnouncement(id: string) {
    this.announcementService.getAnnouncementById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (announcement) => {
          this.announcement = announcement;
          if (!announcement) {
            console.error('Announcement not found');
          }
        },
        error: (error) => {
          console.error('Error loading announcement:', error);
          this.announcement = null;
        }
      });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  goBack() {
    this.location.back();
  }
}
