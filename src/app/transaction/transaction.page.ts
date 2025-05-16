import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.page.html',
  styleUrls: ['./transaction.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HttpClientModule
  ]
})
export class TransactionPage implements OnInit {
  transactionHistory: any[] = [];

  selectedMonth: number = new Date().getMonth() + 1;
  selectedYear: number = new Date().getFullYear();
  months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
    { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
    { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];
  years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadTransactionHistory();
  }

  loadTransactionHistory() {
    const userId = Number(localStorage.getItem('userId'));
    this.http.get<any[]>(`https://localhost:7089/api/Spending/GetTransactionsByMonth?year=${this.selectedYear}&month=${this.selectedMonth}&userId=${userId}`)
      .subscribe({
        next: data => {
          this.transactionHistory = data;
        },
        error: err => {
          console.error('Failed to load transaction history', err);
        }
      });
  }

  onMonthChange() {
    this.loadTransactionHistory();
  }

  exportAsCSV() {
    const headers = ['Date', 'Category', 'Type', 'Amount (RM)', 'Note'];
    const rows = this.transactionHistory.map(tx => [
      new Date(tx.date).toLocaleString(),
      tx.category,
      tx.type,
      tx.amount,
      tx.note || ''
    ]);

    let csvContent = [headers, ...rows]
      .map(e => e.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.setAttribute('download', `transactions_${this.selectedYear}_${this.selectedMonth}.csv`);
    anchor.click();
  }

  exportAsPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Transaction History', 14, 20);

    const columns = ['Date', 'Category', 'Type', 'Amount (RM)', 'Note'];
    const rows = this.transactionHistory.map(tx => [
      new Date(tx.date).toLocaleString(),
      tx.category,
      tx.type,
      tx.amount,
      tx.note || ''
    ]);

    autoTable(doc, {
      startY: 30,
      head: [columns],
      body: rows,
      theme: 'striped'
    });

    doc.save(`transactions_${this.selectedYear}_${this.selectedMonth}.pdf`);
  }
}
