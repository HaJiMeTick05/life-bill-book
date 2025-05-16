import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, NavController } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
selector: 'app-expense',
templateUrl: './expense.page.html',
styleUrls: ['./expense.page.scss'],
standalone: true,
imports: [
IonicModule,
CommonModule,
FormsModule,
HttpClientModule
]
})
export class ExpensePage implements OnInit {
userId: number = 0;
expense = {
amount: null,
note: '',
date: new Date().toISOString(),
type: 'expense',
categoryId: null
};

expenseCategories: any[] = [];

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
this.expenseCategories = res.expenseCategories || [];
},
error: () => {
this.presentToast('Failed to load categories', 'danger');
}
});
}

submitExpense() {
if (!this.expense.amount || !this.expense.categoryId) {
this.presentToast('Please fill in all required fields.', 'warning');
return;
}

const url = `https://localhost:7089/api/Spending/AddExpense?userId=${this.userId}`;
this.http.post(url, this.expense).subscribe({
  next: () => {
    this.presentToast('Expense added successfully', 'success');
    this.navCtrl.navigateBack('/dashboard');
  },
  error: () => {
    this.presentToast('Failed to add expense', 'danger');
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

goBack() {
this.navCtrl.navigateBack('/dashboard');
}
}