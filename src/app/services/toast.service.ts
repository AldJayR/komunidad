import { Injectable, inject } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastController = inject(ToastController);

  /**
   * Show a toast message
   * @param message The message to display
   * @param color The color scheme (success, warning, danger, primary)
   * @param duration Duration in milliseconds (default: 3000)
   * @param position Position on screen (default: 'top')
   */
  async show(
    message: string, 
    color: 'success' | 'warning' | 'danger' | 'primary' = 'primary',
    duration: number = 3000,
    position: 'top' | 'middle' | 'bottom' = 'top'
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      position,
      color
    });
    await toast.present();
  }

  /**
   * Show a success message
   */
  async success(message: string, duration: number = 3000): Promise<void> {
    await this.show(message, 'success', duration);
  }

  /**
   * Show a warning message
   */
  async warning(message: string, duration: number = 3000): Promise<void> {
    await this.show(message, 'warning', duration);
  }

  /**
   * Show an error message
   */
  async error(message: string, duration: number = 3000): Promise<void> {
    await this.show(message, 'danger', duration);
  }

  /**
   * Show an info message
   */
  async info(message: string, duration: number = 3000): Promise<void> {
    await this.show(message, 'primary', duration);
  }
}
