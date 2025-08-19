import { Component, OnInit } from '@angular/core';
import { ReportesService, Cambio } from '../../../core/services/reportes.service';

@Component({
  selector: 'app-reportes-list',
  templateUrl: './reportes-list.component.html',
  styleUrls: ['./reportes-list.component.scss']
})
export class ReportesListComponent implements OnInit {
  cambios: Cambio[] = [];
  loading = false;
  error: string | null = null;

  constructor(private reportesService: ReportesService) {}

  ngOnInit(): void {
    this.loadCambios();
  }

  loadCambios(): void {
    this.loading = true;
    this.error = null;
    
    this.reportesService.getCambios()
      .subscribe({
        next: (response) => {
          this.cambios = response.cambios;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Error al cargar los datos';
          this.loading = false;
        }
      });
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-ES') + ' ' + d.toLocaleTimeString('es-ES');
  }
}
