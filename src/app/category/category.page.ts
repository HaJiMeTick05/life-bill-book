import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonicModule,
  ToastController,
  NavController,
  AlertController  // ✅ 添加 AlertController
} from '@ionic/angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HttpClientModule
  ]
})
export class CategoryPage implements OnInit {
  category = {
    name: '',
    type: ''
  };
  userId: number = 0;
  categoryList: any[] = [];

  constructor(
    private http: HttpClient,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private alertCtrl: AlertController // ✅ 注入 AlertController
  ) {}

  ngOnInit() {
    const storedUserId = localStorage.getItem('userId');
    this.userId = storedUserId ? parseInt(storedUserId, 10) : 0;

    if (this.userId <= 0) {
      this.presentToast('User not logged in', 'danger');
      this.navCtrl.navigateBack('/login');
    } else {
      this.loadCategories();
    }
  }

  loadCategories() {
    this.http.get<any>(`https://localhost:7089/api/Spending/GetCategories?userId=${this.userId}`)
      .subscribe({
        next: (res) => {
          this.categoryList = [...(res.incomeCategories || []), ...(res.expenseCategories || [])];
        },
        error: () => {
          this.presentToast('Failed to load categories.', 'danger');
        }
      });
  }

  async addCategory() {
    if (!this.category.name || !this.category.type) {
      this.presentToast('Please provide all the fields.', 'danger');
      return;
    }

    const url = 'https://localhost:7089/api/Spending/AddCategory';
    const data = { name: this.category.name, type: this.category.type };

    this.http.post(url, data, {
      params: { userId: this.userId.toString() }
    }).subscribe({
      next: async (response: any) => {
        this.presentToast(response.message || 'Category added successfully!', 'success');
        this.category.name = '';
        this.category.type = '';
        this.loadCategories();
      },
      error: async (error) => {
        const msg = error.status === 409 ? 'Category already exists.' : 'Failed to add category.';
        this.presentToast(msg, 'danger');
      }
    });
  }

 
  async confirmDelete(categoryId: number) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this category?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.deleteCategory(categoryId)
        }
      ]
    });
    await alert.present();
  }


  deleteCategory(categoryId: number) {
    const url = 'https://localhost:7089/api/Spending/DeleteCategory';
    this.http.delete(url, {
      params: {
        categoryId: categoryId.toString(),
        userId: this.userId.toString()
      }
    }).subscribe({
      next: () => {
        this.presentToast('Category deleted successfully.', 'success');
        this.loadCategories();
      },
      error: () => {
        this.presentToast('Failed to delete category.', 'danger');
      }
    });
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}
