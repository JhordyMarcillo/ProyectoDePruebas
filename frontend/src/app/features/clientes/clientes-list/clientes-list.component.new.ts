import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  email: string;
}

@Component({
  selector: 'app-clientes-list',
  templateUrl: './clientes-list.component.html',
  styleUrls: ['./clientes-list.component.scss']
})
export class ClientesListComponent implements OnInit {
  clientes: Cliente[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes() {
    // Datos de ejemplo por ahora
    this.clientes = [
      {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        cedula: '12345678',
        telefono: '555-0123',
        email: 'juan@email.com'
      },
      {
        id: 2,
        nombre: 'María',
        apellido: 'González',
        cedula: '87654321',
        telefono: '555-0456',
        email: 'maria@email.com'
      }
    ];
  }

  createCliente() {
    console.log('Crear cliente');
  }

  editCliente(cliente: Cliente) {
    console.log('Editar cliente:', cliente);
  }

  deleteCliente(id: number) {
    console.log('Eliminar cliente:', id);
  }
}
