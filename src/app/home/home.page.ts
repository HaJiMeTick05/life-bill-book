import { Component } from '@angular/core';
import {
  IonicModule,
  NavController,
  LoadingController,
  AlertController
} from '@ionic/angular';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonicModule, FormsModule, HttpClientModule],
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  email = '';
  password = '';
  userId: number | null = null;

  constructor(
    private http: HttpClient,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  async login() {
    const loginData = {
      email: this.email.trim(),
      password: this.password
    };

    const loading = await this.loadingCtrl.create({
      message: 'Logging in...',
      spinner: 'crescent',
      backdropDismiss: false
    });
    await loading.present();

    this.http.post<{ user?: { id: number }, message?: string }>(
      'https://localhost:7089/api/User/UserLogin',
      loginData
    ).subscribe({
      next: async (response) => {
        await loading.dismiss();

        if (response?.user?.id) {
          this.userId = response.user.id;
          localStorage.setItem('userId', this.userId.toString());

          this.getUserDetails(this.userId);

          await this.showAlert('Success', 'Login Successful!');
          this.navCtrl.navigateForward('/dashboard');
        } else {
          await this.showAlert('Login failed', response?.message || 'Invalid login response.');
        }
      },
      error: async (error) => {
        await loading.dismiss();
        console.error('Login error:', error);
        await this.showAlert('Error', 'An error occurred. Please try again.');
      }
    });
  }

  getUserDetails(userId: number) {
    this.http.get(`https://localhost:7089/api/User/GetByUserId/${userId}`).subscribe({
      next: (userDetails) => {
        console.log('User details:', userDetails);
        // Optionally store userDetails for later use
      },
      error: (error) => {
        console.error('Failed to fetch user details:', error);
      }
    });
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
