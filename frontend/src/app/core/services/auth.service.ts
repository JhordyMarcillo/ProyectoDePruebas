import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { ApiResponse, LoginRequest, LoginResponse, Usuario } from '@core/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('spa_token');
    const user = localStorage.getItem('spa_user');
    
    if (token && user) {
      this.tokenSubject.next(token);
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.setSession(response.data);
          }
        })
      );
  }

  register(userData: Usuario): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(`${this.API_URL}/auth/register`, userData);
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  clearTokens(): void {
    this.clearSession();
  }

  getProfile(): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.API_URL}/auth/profile`);
  }

  updateProfile(userData: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(`${this.API_URL}/auth/profile`, userData)
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.currentUserSubject.next(response.data);
            localStorage.setItem('spa_user', JSON.stringify(response.data));
          }
        })
      );
  }

  private setSession(authResult: LoginResponse): void {
    localStorage.setItem('spa_token', authResult.token);
    localStorage.setItem('spa_user', JSON.stringify(authResult.user));
    
    this.tokenSubject.next(authResult.token);
    this.currentUserSubject.next(authResult.user);
  }

  private clearSession(): void {
    localStorage.removeItem('spa_token');
    localStorage.removeItem('spa_user');
    
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
  }

  public get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  public get tokenValue(): string | null {
    return this.tokenSubject.value;
  }

  public getToken(): string | null {
    return this.tokenValue;
  }

  public isAuthenticated(): boolean {
    return !!this.tokenValue;
  }

  public hasPermission(permission: string): boolean {
    const user = this.currentUserValue;
   
    // Si no hay usuario, no tiene permisos
    if (!user) {
      return false;
    }
    
    // Si no hay permisos definidos, no tiene permisos
    if (!user.permisos || !Array.isArray(user.permisos)) {
      return false;
    }
    
    // Verificar permiso exacto
    const hasExactPermission = user.permisos.includes(permission);
    
    // Para Inventario, también aceptar Productos
    let hasPermiso = hasExactPermission;
    if (permission === 'Inventario') {
      hasPermiso = hasExactPermission || user.permisos.includes('Productos');
    }
    
    
    return hasPermiso;
  }

  public hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return user?.perfil === role;
  }

  public hasAnyRole(roles: string[]): boolean {
    const user = this.currentUserValue;
    return roles.includes(user?.perfil || '');
  }
}
