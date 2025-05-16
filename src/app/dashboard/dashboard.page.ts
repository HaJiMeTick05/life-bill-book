import { Component, OnInit } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular'; 
import { ActionSheetController } from '@ionic/angular';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonItem,
  IonButton, ToastController, IonButtons, IonList, IonLabel, IonNote
} from '@ionic/angular'; 
import { NavController } from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';

import { Chart, registerables } from 'chart.js'; 
Chart.register(...registerables); 

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HttpClientModule
  ]
})
export class DashboardPage implements OnInit, ViewWillEnter {
  transactions: any[] = [];
  filteredTransactions: any[] = [];

  totalIncome: number = 0;
  totalExpense: number = 0;
  balance: number = 0;
  incomePercent: number = 0;
  expensePercent: number = 0;
  selectedYear: number = new Date().getFullYear();
  selectedMonth: number = new Date().getMonth() + 1;

  monthlyExpenses: { [month: string]: number } = {};
  monthlyChart: any;

  constructor(
    private navCtrl: NavController,
    private http: HttpClient,
    private toastController: ToastController,
    private actionSheetCtrl: ActionSheetController 
  ) {}

  ngOnInit() {
   
  }
   
  async openMenu(ev: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Menu',
      buttons: [
        {
          text: 'Add Category',
          icon: 'Category',
          handler: () => {
            this.navCtrl.navigateForward('/category'); 
          }
        },
        {
          text: 'Transactions History', 
          icon: 'Transactions History',
          handler: () => {
            this.navCtrl.navigateForward('/transaction'); 
          }
        },
        {
          text: 'Reset Data',
          icon: 'trash',
          handler: () => {
            this.resetData();
          }
        },
        {
          text: 'Logout',
          icon: 'Logout',
          handler: () => {
            this.navCtrl.navigateForward('/home'); 
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }
  
  resetData() {
    const userId = Number(localStorage.getItem('userId'));
    this.http.delete(`https://localhost:7089/api/Spending/ResetUserTransactions?userId=${userId}`).subscribe({
      next: (res) => {
        this.transactions = []; 
        this.filteredTransactions = [];
        this.totalIncome = 0;
        this.totalExpense = 0;
        this.balance = 0;
        this.incomePercent = 0;
        this.expensePercent = 0;
        this.monthlyExpenses = {}; 
        this.presentToast("Data has been reset.");
  
       
        this.loadTransactionsByMonth(this.selectedYear, this.selectedMonth); 
      },
      error: () => this.presentToast("Failed to reset data", "danger")
    });
  }
  
  


  ionViewWillEnter() {
    const today = new Date();
    this.loadTransactionsByMonth(today.getFullYear(), today.getMonth() + 1);
  }


  loadTransactionsByMonth(year: number, month: number) {
    const userId = Number(localStorage.getItem('userId'));
    this.http.get<any[]>(`https://localhost:7089/api/Spending/GetTransactionsByMonth?year=${year}&month=${month}&userId=${userId}`).subscribe({
      next: (data) => {
        this.transactions = data;
        this.filteredTransactions = data;
        this.calculateSummary();
        this.calculateMonthlyExpenses();
  
        setTimeout(() => {
          this.renderMonthlyChart();
        }, 300);
      },
      error: () => {
        this.presentToast('Failed to load monthly transactions', 'danger');
      }
    });
  }

  calculateSummary() {
    this.totalIncome = this.transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);

    this.totalExpense = this.transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const total = this.totalIncome + this.totalExpense;

    this.incomePercent = total > 0 ? (this.totalIncome / total) * 100 : 0;
    this.expensePercent = total > 0 ? (this.totalExpense / total) * 100 : 0;

    this.balance = this.totalIncome - this.totalExpense;
  }

  calculateMonthlyExpenses() {
    this.monthlyExpenses = {};
    this.transactions.forEach(tx => {
      if (tx.type === 'expense') {
        const date = new Date(tx.date);
        const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        this.monthlyExpenses[key] = (this.monthlyExpenses[key] || 0) + tx.amount;
      }
    });
  }

  renderMonthlyChart() {
    const key = `${this.selectedYear}-${this.selectedMonth.toString().padStart(2, '0')}`;
    const expense = this.transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
  
    if (this.monthlyChart) {
      this.monthlyChart.destroy();
    }
  
    const ctx = document.getElementById('monthlyChart') as HTMLCanvasElement;
    if (ctx) {
      this.monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [key],
          datasets: [{
            label: 'Monthly Expenses (RM)',
            data: [expense],
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 50
              }
            }
          }
        }
      });
    }
  }

  filterTransactions(type: string) {
    if (type === 'income') {
      this.filteredTransactions = this.transactions.filter(tx => tx.type === 'income');
    } else if (type === 'expense') {
      this.filteredTransactions = this.transactions.filter(tx => tx.type === 'expense');
    } else {
      this.filteredTransactions = this.transactions;
    }
  }

  goToIncomePage() {
    this.navCtrl.navigateForward('/income');
  }

  goToExpensePage() {
    this.navCtrl.navigateForward('/expense');
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

  getMergedTransactionsByType(type: string) {
    const merged: { [category: string]: number } = {};
    for (const tx of this.filteredTransactions.filter(t => t.type === type)) {
      if (!merged[tx.category]) {
        merged[tx.category] = 0;
      }
      merged[tx.category] += tx.amount;
    }
    return Object.entries(merged).map(([category, total]) => ({
      category,
      total
    }));
  }

  changeMonth(direction: number) {
    this.selectedMonth += direction;
    if (this.selectedMonth > 12) {
      this.selectedMonth = 1;
      this.selectedYear++;
    } else if (this.selectedMonth < 1) {
      this.selectedMonth = 12;
      this.selectedYear--;
    }
    this.onMonthChanged();
  }

  onMonthChanged() {
    this.loadTransactionsByMonth(this.selectedYear, this.selectedMonth);
  }
}
