import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { PermissionGuard } from './core/guards/permission.guard';
import { LoginComponent } from './features/auth/login/login.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'auth/login',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permission: 'Inicio' }
  },
  {
    path: 'clientes',
    loadChildren: () => import('./features/clientes/clientes.module').then(m => m.ClientesModule),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permission: 'Cliente' }
  },
  {
    path: 'productos',
    loadChildren: () => import('./features/productos/productos.module').then(m => m.ProductosModule),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permission: 'Inventario' }
  },
  {
    path: 'servicios',
    loadChildren: () => import('./features/servicios/servicios.module').then(m => m.ServiciosModule),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permission: 'Servicios' }
  },
  {
    path: 'proveedores',
    loadChildren: () => import('./features/proveedores/proveedores.module').then(m => m.ProveedoresModule),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permission: 'Proveedores' }
  },
  {
    path: 'ventas',
    loadChildren: () => import('./features/ventas/ventas.module').then(m => m.VentasModule),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permission: 'Ventas' }
  },
  {
    path: 'reportes',
    loadChildren: () => import('./features/reportes/reportes.module').then(m => m.ReportesModule),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permission: 'Reportes' }
  },
  {
    path: 'usuarios',
    loadChildren: () => import('./features/usuarios/usuarios.module').then(m => m.UsuariosModule),
    canActivate: [AuthGuard, PermissionGuard],
    data: { permission: 'Asignar' }
  },
  {
    path: 'asignar',
    redirectTo: '/usuarios',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    enableTracing: false,
    useHash: false
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
