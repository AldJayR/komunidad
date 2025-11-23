import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonSearchbar,
  IonIcon,
  IonButton,
  IonLabel,
  IonChip,
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  optionsOutline, 
  warning, 
  locationOutline, 
  searchOutline,
  timeOutline,
  trendingUpOutline,
  calendarOutline
} from 'ionicons/icons';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Auth, UserProfile } from '../../services/auth';
import { Announcement, AnnouncementData } from '../../services/announcement';
import { Barangay, BarangayData } from '../../services/barangay';

interface DateRange {
  label: string;
  value: string;
}

interface SortOption {
  label: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'app-search',
  templateUrl: 'search.page.html',
  styleUrls: ['search.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonSearchbar,
    IonIcon,
    IonButton,
    IonLabel,
    IonChip,
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardContent,
    IonCardTitle,
    IonSpinner
  ]
})
export class SearchPage implements OnInit {
  private router = inject(Router);
  private authService = inject(Auth);
  private announcementService = inject(Announcement);
  private barangayService = inject(Barangay);
  private destroyRef = inject(DestroyRef);
  
  searchFocused = false;
  loading = false;
  searchQuery = '';
  
  // Filter options
  categories = ['All', 'Emergency', 'Events', 'Health', 'Safety', 'Announcement'];
  selectedCategory = 'All';
  
  dateRanges: DateRange[] = [
    { label: 'All Time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Last 3 Months', value: '3months' }
  ];
  selectedDateRange = 'all';
  
  barangays: BarangayData[] = [];
  selectedBarangay = 'all';
  
  sortOptions: SortOption[] = [
    { label: 'Newest', value: 'newest', icon: 'time-outline' },
    { label: 'Oldest', value: 'oldest', icon: 'calendar-outline' },
    { label: 'Most Relevant', value: 'relevant', icon: 'trending-up-outline' }
  ];
  selectedSort = 'newest';
  
  // Data
  allAnnouncements: AnnouncementData[] = [];
  filteredAnnouncements: AnnouncementData[] = [];
  
  private searchSubject = new Subject<string>();
  private barangayMap = new Map<string, string>();

  constructor() {
    addIcons({ 
      optionsOutline, 
      warning, 
      locationOutline, 
      searchOutline,
      timeOutline,
      trendingUpOutline,
      calendarOutline
    });
    
    // Setup search debouncing
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(query => {
        this.searchQuery = query;
        this.applyFilters();
      });
  }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    
    try {
      // Load all barangays
      this.barangayService.getBarangays()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(barangays => {
          this.barangays = barangays;
          // Create barangay ID to name map
          barangays.forEach(b => this.barangayMap.set(b.id, b.name));
        });
      
      // Load all announcements (cross-barangay search)
      this.announcementService.getAllAnnouncements()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(announcements => {
          this.allAnnouncements = announcements;
          this.applyFilters();
          this.loading = false;
        });
    } catch (error) {
      console.error('Error loading search data:', error);
      this.loading = false;
    }
  }

  onSearchInput(event: any) {
    const query = event.target.value || '';
    this.searchSubject.next(query.toLowerCase());
  }

  selectCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  selectDateRange(range: string) {
    this.selectedDateRange = range;
    this.applyFilters();
  }

  selectSort(sort: string) {
    this.selectedSort = sort;
    this.applyFilters();
  }

  clearAllFilters() {
    this.searchQuery = '';
    this.selectedCategory = 'All';
    this.selectedDateRange = 'all';
    this.selectedBarangay = 'all';
    this.selectedSort = 'newest';
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.allAnnouncements];

    // Filter by category
    if (this.selectedCategory !== 'All') {
      filtered = filtered.filter(a => a.category === this.selectedCategory);
    }

    // Filter by barangay
    if (this.selectedBarangay !== 'all') {
      filtered = filtered.filter(a => a.barangayId === this.selectedBarangay);
    }

    // Filter by date range
    if (this.selectedDateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter(a => {
        const announcementDate = new Date(a.datePosted);
        
        switch (this.selectedDateRange) {
          case 'today':
            return this.isSameDay(announcementDate, now);
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return announcementDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            return announcementDate >= monthAgo;
          case '3months':
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            return announcementDate >= threeMonthsAgo;
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(this.searchQuery) ||
        a.description.toLowerCase().includes(this.searchQuery)
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      switch (this.selectedSort) {
        case 'oldest':
          return new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime();
        case 'relevant':
          // Simple relevance: prioritize title matches, then Emergency category
          const aScore = this.getRelevanceScore(a);
          const bScore = this.getRelevanceScore(b);
          return bScore - aScore;
        case 'newest':
        default:
          return new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime();
      }
    });

    this.filteredAnnouncements = filtered;
  }

  private getRelevanceScore(announcement: AnnouncementData): number {
    let score = 0;
    
    // Title match is more relevant
    if (this.searchQuery && announcement.title.toLowerCase().includes(this.searchQuery)) {
      score += 10;
    }
    
    // Emergency announcements are more relevant
    if (announcement.category === 'Emergency') {
      score += 5;
    }
    
    // Recent announcements are more relevant
    const daysSincePosted = (Date.now() - new Date(announcement.datePosted).getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 10 - daysSincePosted);
    
    return score;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  isSearchActive(): boolean {
    return this.searchQuery.trim() !== '' ||
           this.selectedCategory !== 'All' ||
           this.selectedDateRange !== 'all' ||
           this.selectedBarangay !== 'all';
  }

  getRelativeDate(timestamp: any): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    } else if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return months === 1 ? '1 month ago' : `${months} months ago`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return years === 1 ? '1 year ago' : `${years} years ago`;
    }
  }

  getBarangayName(barangayId: string): string {
    return this.barangayMap.get(barangayId) || 'Unknown Barangay';
  }

  viewAnnouncement(announcement: AnnouncementData) {
    if (announcement.id) {
      this.router.navigate(['/announcement', announcement.id]);
    }
  }
}
