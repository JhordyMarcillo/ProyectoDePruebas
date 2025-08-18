import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Usuario } from './core/models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'SPA System';
  currentUser$: Observable<Usuario | null>;
  currentUser: Usuario | null = null;
  showSidebar = false;
  showLogoutModalFlag = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    // Verificar si hay una sesión activa
    this.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.showSidebar = !!user;
    });
  }

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  showLogoutModal() {
    this.showLogoutModalFlag = true;
  }

  cancelLogout() {
    this.showLogoutModalFlag = false;
  }

  confirmLogout() {
    this.showLogoutModalFlag = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  logout() {
    if (confirm('¿Está seguro que desea cerrar sesión?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
