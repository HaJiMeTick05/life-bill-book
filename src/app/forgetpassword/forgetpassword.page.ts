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
  IonLabel, // ✅ 加上这一行
  ToastController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-forgetpassword',
  templateUrl: './forgetpassword.page.html',
  styleUrls: ['./forgetpassword.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonInput,
    IonItem,
    IonButton,
    IonLabel, 
    CommonModule,
    FormsModule,
    HttpClientModule
  ],
  
})

export class ForgetpasswordPage implements OnInit {

  step = 1; 
  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';

  constructor(private http: HttpClient, private toastController: ToastController, private router: Router) {}

  ngOnInit() {}

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  sendOtp() {
    this.http.post('https://localhost:7089/api/User/SendOtp', { email: this.email }).subscribe({
      next: (res: any) => {
        this.presentToast('OTP sent!', 'success');
        this.step = 2;
      },
      error: () => {
        this.presentToast('Failed to send OTP.', 'danger');
      }
    });
  }

  verifyOtp() {
    this.http.post('https://localhost:7089/api/User/VerifyOtp', { email: this.email, otp: this.otp }).subscribe({
      next: (res: any) => {
        this.presentToast('OTP verified!', 'success');
        this.step = 3;
      },
      error: () => {
        this.presentToast('Incorrect OTP.', 'danger');
      }
    });
  }

  resetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.presentToast('Passwords do not match.', 'danger');
      return;
    }
  
    this.http.post('https://localhost:7089/api/User/ResetPassword', {
      email: this.email,
      otp: this.otp,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword
    }).subscribe({
      next: () => {
        this.presentToast('Password reset successfully!', 'success');
        this.email = this.otp = this.newPassword = this.confirmPassword = '';
        
   
        setTimeout(() => {
          this.router.navigate(['/home']); 
        }, 2000);
      },
      error: () => {
        this.presentToast('Failed to reset password.', 'danger');
      }
    });
  }
  
  
}
