import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface DashboardStats {
  clients_count: number;
  products_count: number;
  services_count: number;
  providers_count: number;
  sales_count: number;
  users_count: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    clients_count: 0,
    products_count: 0,
    services_count: 0,
    providers_count: 0,
    sales_count: 0,
    users_count: 0
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    // Simular datos por ahora
    this.stats = {
      clients_count: 25,
      products_count: 150,
      services_count: 12,
      providers_count: 8,
      sales_count: 45,
      users_count: 3
    };
  }
}
