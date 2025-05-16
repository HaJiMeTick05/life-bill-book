import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, NavController } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
selector: 'app-income',
standalone: true,
templateUrl: './income.page.html',
styleUrls: ['./income.page.scss'],
imports: [
CommonModule,
FormsModule,
IonicModule,
HttpClientModule
]
})
export class IncomePage implements OnInit {
userId: number = 0;

income = {
amount: null,
note: '',
date: new Date().toISOString(),
type: 'income',
categoryId: null
};

incomeCategories: any[] = [];

constructor(
private http: HttpClient,
private toastController: ToastController,
private navCtrl: NavController
) {}

ngOnInit() {
const storedUserId = localStorage.getItem('userId');
this.userId = storedUserId ? parseInt(storedUserId, 10) : 0;


if (this.userId > 0) {
  this.loadCategories();
} else {
  this.presentToast('User not logged in', 'danger');
  this.navCtrl.navigateBack('/login');
}
}

loadCategories() {
  const url = `https://localhost:7089/api/Spending/GetCategories?userId=${this.userId}`;
this.http.get<any>(url).subscribe({
next: (res) => {
this.incomeCategories = res.incomeCategories || [];
},
error: () => {
this.presentToast('Failed to load categories', 'danger');
}
});
}

submitIncome() {
if (!this.income.amount || !this.income.categoryId) {
this.presentToast('Please fill all required fields', 'warning');
return;
}


const url = `https://localhost:7089/api/Spending/AddIncome?userId=${this.userId}`;
this.http.post(url, this.income).subscribe({
  next: () => {
    this.presentToast('Income added successfully', 'success');
    this.navCtrl.navigateBack('/dashboard');
  },
  error: () => {
    this.presentToast('Failed to add income', 'danger');
  }
});
}

async presentToast(message: string, color: string = 'primary') {
const toast = await this.toastController.create({
message,
duration: 2000,
color,
position: 'bottom'
});
await toast.present();
}
}