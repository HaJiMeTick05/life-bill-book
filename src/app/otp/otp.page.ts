import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, HttpClientModule]
})
export class OtpPage implements OnInit {

  email: string = '';
  otp: string = '';
  isOtpSent = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router
    
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      if (this.email) {
        this.sendOtp();
      } else {
        this.presentToast('No email provided', 'danger');
      }
    });
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color,
      position: 'bottom'
    });
    toast.present();
  }

  async sendOtp() {
    try {
      const response: any = await this.http.post('https://localhost:7089/api/User/SendOtp', { email: this.email }).toPromise();
      if (response.success) {
        this.presentToast('OTP sent to your email!', 'success');
      } else {
        this.presentToast(response.message || 'Failed to send OTP.', 'danger');
      }
    } catch (error) {
      console.error('Send OTP error', error);
      this.presentToast('An error occurred while sending OTP.', 'danger');
    }
  }
  

  verifyOtp() {
    this.http.post('https://localhost:7089/api/User/VerifyOtp', {
      email: this.email,
      otp: this.otp
    }).subscribe({
      next: (res: any) => {
        this.presentToast('OTP Verified!', 'success');
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 2000); 
      },
      error: () => {
        this.presentToast('Incorrect OTP.', 'danger');
      }
    });
  }
  
}
