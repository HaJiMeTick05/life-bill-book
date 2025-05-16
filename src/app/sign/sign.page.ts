import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonInput,
  IonItem,
  IonButton,
  ToastController
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-sign',
  templateUrl: './sign.page.html',
  styleUrls: ['./sign.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonInput,
    IonItem,
    IonButton,
    CommonModule,
    FormsModule,
    HttpClientModule
  ]
})
export class SignPage implements OnInit {

  signUpData = {
    name: '',
    email: '',
    password: ''
  };

  isLoading = false;

  constructor(
    private navCtrl: NavController,
    private http: HttpClient,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2500,
      color: color,
      position: 'bottom',
      cssClass: 'mobile-toast'
    });
    await toast.present();
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async onSubmit() {
    if (
      !this.signUpData.name.trim() ||
      !this.signUpData.email.trim() ||
      !this.signUpData.password.trim()
    ) {
      this.presentToast('Please fill in all fields.', 'warning');
      return;
    }

    if (!this.validateEmail(this.signUpData.email)) {
      this.presentToast('Please enter a valid email address.', 'warning');
      return;
    }

    if (this.signUpData.password.length < 6) {
      this.presentToast('Password must be at least 6 characters.', 'warning');
      return;
    }

    this.isLoading = true;
    try {
      const response: any = await this.http
        .post('https://localhost:7089/api/User/SignUp', this.signUpData)
        .toPromise();

      this.presentToast('Sign Up Successful!', 'success');

      setTimeout(() => {
        this.navCtrl.navigateForward('/otp', {
          queryParams: { email: this.signUpData.email }
        });
      }, 2000);

    } catch (error: any) {
      console.error('Sign Up error', error);
      if (error.status === 409) {
        this.presentToast(error.error.message || 'Email or Username already exists.', 'danger');
      } else {
        this.presentToast('An error occurred during sign up.', 'danger');
      }
    } finally {
      this.isLoading = false;
    }
  }

  goToLogin() {
    this.navCtrl.navigateForward('/home');
  }

}
