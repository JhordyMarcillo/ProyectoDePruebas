import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductoService } from '../../../core/services/producto.service';
import { Producto } from '../../../core/models';

@Component({
  selector: 'app-producto-form',
  templateUrl: './producto-form.component.html',
  styleUrls: ['./producto-form.component.scss']
})
export class ProductoFormComponent implements OnInit {
  productoForm: FormGroup;
  isEditing = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ProductoFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Producto
  ) {
    this.isEditing = !!data;
    this.productoForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditing && this.data) {
      this.productoForm.patchValue(this.data);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      nombre: ['', [Validators.required]],
      descripcion: [''],
      codigo: [''],
      categoria: [''],
      marca: [''],
      cantidad_stock: [0, [Validators.required, Validators.min(0)]],
      stock_minimo: [0, [Validators.min(0)]],
      precio_compra: [0, [Validators.required, Validators.min(0)]],
      precio_venta: [0, [Validators.required, Validators.min(0)]],
      estado: ['activo', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.productoForm.valid) {
      this.isLoading = true;
      const formData = this.productoForm.value;

      const operation = this.isEditing
        ? this.productoService.updateProducto(this.data.id!, formData)
        : this.productoService.createProducto(formData);

      operation.subscribe({
        next: () => {
          this.isLoading = false;
          this.snackBar.open(
            `Producto ${this.isEditing ? 'actualizado' : 'creado'} correctamente`,
            'Cerrar',
            { duration: 3000 }
          );
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          this.isLoading = false;
          this.snackBar.open('Error al guardar producto', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
