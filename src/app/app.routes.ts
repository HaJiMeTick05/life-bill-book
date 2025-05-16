import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.page').then( m => m.DashboardPage)
  },
  {
    path: 'sign',
    loadComponent: () => import('./sign/sign.page').then( m => m.SignPage)
  },
  {
    path: 'otp',
    loadComponent: () => import('./otp/otp.page').then( m => m.OtpPage)
  },

  {
    path: 'forgetpassword',
    loadComponent: () => import('./forgetpassword/forgetpassword.page').then( m => m.ForgetpasswordPage)
  },
  {
    path: 'addtransaction',
    loadComponent: () => import('./addtransaction/addtransaction.page').then( m => m.AddtransactionPage)
  },
  {
    path: 'income',
    loadComponent: () => import('./income/income.page').then( m => m.IncomePage)
  },
  {
    path: 'expense',
    loadComponent: () => import('./expense/expense.page').then( m => m.ExpensePage)
  },
  {
    path: 'transaction',
    loadComponent: () => import('./transaction/transaction.page').then( m => m.TransactionPage)
  },
  {
    path: 'category',
    loadComponent: () => import('./category/category.page').then( m => m.CategoryPage)
  },

]
