import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginDto, RegisterDto, User } from '../models/user.model';

interface JwtPayload {
  nameid: string;
  sub?: string;
  email: string;
  unique_name: string;
  role?: string;
  exp: number;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly ACCESS_KEY = 'access_token';
  private readonly REFRESH_KEY = 'refresh_token';
  private readonly EXPIRES_KEY = 'expires_at';

  private _token = signal<string | null>(localStorage.getItem(this.ACCESS_KEY));

  readonly isLoggedIn = computed(() => !!this._token());

  readonly currentUser = computed<User | null>(() => {
    const token = this._token();
    if (!token) return null;
    try {
      const payload = jwtDecode<JwtPayload>(token);
      const id =
        payload.nameid ||
        payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        payload.sub ||
        '';
      return {
        id,
        email: payload.email,
        name: payload.unique_name,
        role: (payload.role || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]) as User['role']
      };
    } catch {
      return null;
    }
  });

  readonly isRecruiter = computed(() => this.currentUser()?.role === 'recruiter');
  readonly isCandidate = computed(() => this.currentUser()?.role === 'candidate');
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor(private http: HttpClient, private router: Router) {}

  login(dto: LoginDto) {
    return this.http
      .post<AuthResponseDto>(`${environment.apiUrl}/auth/login`, dto)
      .pipe(
        tap(res => this.setTokens(res))
      );
  }

  refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http
      .post<AuthResponseDto>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(tap(res => this.setTokens(res)));
  }

  register(dto: RegisterDto) {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/register`, dto);
  }

  logout() {
    localStorage.removeItem(this.ACCESS_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.EXPIRES_KEY);
    this._token.set(null);
    this.router.navigate(['/login']);
  }

  getAccessToken() {
    return this._token();
  }

  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  private setTokens(res: AuthResponseDto) {
    localStorage.setItem(this.ACCESS_KEY, res.accessToken);
    localStorage.setItem(this.REFRESH_KEY, res.refreshToken);
    localStorage.setItem(this.EXPIRES_KEY, res.expiresAt);
    this._token.set(res.accessToken);
  }
}
