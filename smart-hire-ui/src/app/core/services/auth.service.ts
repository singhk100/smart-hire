import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginDto, RegisterDto, User } from '../models/user.model';

interface JwtPayload {
  nameid: string;
  email: string;
  unique_name: string;
  role: string;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'sh_token';
  private _token = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));

  readonly isLoggedIn = computed(() => !!this._token());
  readonly currentUser = computed<User | null>(() => {
    const token = this._token();
    if (!token) return null;
    try {
      const payload = jwtDecode<JwtPayload>(token);
      debugger
      return {
        id: payload.nameid,
        email: payload.email,
        name: payload.unique_name,
        role: payload.role as User['role']
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
    return this.http.post<{ token: string }>(`${environment.apiUrl}/auth/login`, dto).pipe(
      tap(res => this.setToken(res.token))
    );
  }

  register(dto: RegisterDto) {
    return this.http.post<string>(`${environment.apiUrl}/auth/register`, dto);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this._token.set(null);
    this.router.navigate(['/login']);
  }

  getToken() {
    return this._token();
  }

  private setToken(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    this._token.set(token);
  }
}
