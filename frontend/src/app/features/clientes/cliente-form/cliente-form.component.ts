import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ClientesService, Cliente } from '../../../core/services/clientes.service';

@Component({
  selector: 'app-cliente-form',
  templateUrl: './cliente-form.component.html',
  styleUrls: ['./cliente-form.component.scss']
})
export class ClienteFormComponent implements OnInit {
  clienteForm: FormGroup;
  isEditMode = false;
  clienteId: number | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private clientesService: ClientesService
  ) {
    this.clienteForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.clienteId = +params['id'];
        this.loadCliente();
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      cedula: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      numero: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.email]],
      fecha_nacimiento: [''],
      genero: ['M'],
      locacion: [''],
      estado: ['activo']
    });
  }

  loadCliente(): void {
    if (!this.clienteId) return;

    this.loading = true;
    this.clientesService.getCliente(this.clienteId).subscribe({
      next: (cliente) => {
        this.clienteForm.patchValue(cliente);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar cliente:', error);
        this.error = 'Error al cargar los datos del cliente';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.clienteForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const clienteData: Cliente = this.clienteForm.value;

    const operation = this.isEditMode 
      ? this.clientesService.updateCliente(this.clienteId!, clienteData)
      : this.clientesService.createCliente(clienteData);

    operation.subscribe({
      next: () => {
        this.router.navigate(['/clientes']);
      },
      error: (error) => {
        console.error('Error al guardar cliente:', error);
        this.error = 'Error al guardar el cliente';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/clientes']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.clienteForm.controls).forEach(key => {
      const control = this.clienteForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.clienteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.clienteForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} es requerido`;
      if (field.errors['minlength']) return `${fieldName} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['pattern']) return `${fieldName} tiene un formato inválido`;
      if (field.errors['email']) return 'Email tiene un formato inválido';
    }
    return '';
  }
}
