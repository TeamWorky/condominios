import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
  SelectCondominioRequest,
  SelectCondominioResponse,
  AuthState,
  User,
  Condominio,
  AuthTokens
} from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/api/v1/auth`;
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';
  private readonly CONDOMINIOS_KEY = 'condominios_data';
  private readonly SELECTED_CONDOMINIO_KEY = 'selected_condominio';

  private authState$ = new BehaviorSubject<AuthState>(this.getInitialState());

  constructor(private http: HttpClient) {
    this.loadStoredState();
  }

  private getInitialState(): AuthState {
    return {
      user: null,
      condominios: [],
      selectedCondominio: null,
      tokens: null,
      isAuthenticated: false
    };
  }

  private loadStoredState(): void {
    try {
      const accessToken = localStorage.getItem(this.TOKEN_KEY);
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      const userData = localStorage.getItem(this.USER_KEY);
      const selectedCondominioData = localStorage.getItem(this.SELECTED_CONDOMINIO_KEY);

      if (accessToken && userData && userData !== 'undefined' && userData !== 'null') {
        this.authState$.next({
          user: JSON.parse(userData),
          condominios: [],
          selectedCondominio: selectedCondominioData && selectedCondominioData !== 'undefined' && selectedCondominioData !== 'null' ? JSON.parse(selectedCondominioData) : null,
          tokens: { accessToken, refreshToken: refreshToken || '' },
          isAuthenticated: true
        });
      }
    } catch (error) {
      this.logout();
    }
  }

  getAuthState(): Observable<AuthState> {
    return this.authState$.asObservable();
  }

  getCurrentUser(): User | null {
    return this.authState$.value.user;
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getSelectedCondominio(): Condominio | null {
    return this.authState$.value.selectedCondominio;
  }

  isAuthenticated(): boolean {
    return this.authState$.value.isAuthenticated;
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(data => {
          localStorage.removeItem(this.CONDOMINIOS_KEY);
          localStorage.removeItem(this.SELECTED_CONDOMINIO_KEY);

          localStorage.setItem(this.TOKEN_KEY, data.accessToken);
          localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);
          localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));

          const condominiosArray = Array.isArray(data.condominios) ? data.condominios : [];

          this.authState$.next({
            user: data.user,
            condominios: condominiosArray,
            selectedCondominio: null,
            tokens: {
              accessToken: data.accessToken,
              refreshToken: data.refreshToken
            },
            isAuthenticated: true
          });
        })
      );
  }

  selectCondominio(condominioId: string): Observable<SelectCondominioResponse> {
    const request: SelectCondominioRequest = { condominioId };

    return this.http.post<SelectCondominioResponse>(
      `${this.API_URL}/select-condominio`,
      request
    ).pipe(
      tap(data => {
        // Actualizar tokens con el nuevo JWT que contiene el condominioId
        localStorage.setItem(this.TOKEN_KEY, data.accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);

        // Encontrar y guardar el condominio seleccionado
        const currentState = this.authState$.value;
        const selectedCondominio = currentState.condominios.find(c => c.id === condominioId);

        if (selectedCondominio) {
          localStorage.setItem(this.SELECTED_CONDOMINIO_KEY, JSON.stringify(selectedCondominio));

          this.authState$.next({
            ...currentState,
            selectedCondominio,
            tokens: {
              accessToken: data.accessToken,
              refreshToken: data.refreshToken
            }
          });
        }
      })
    );
  }

  logout(): void {
    this.http.post(`${this.API_URL}/logout`, {}).subscribe({
      error: () => {}
    });

    // Limpiar localStorage siempre
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.CONDOMINIOS_KEY);
    localStorage.removeItem(this.SELECTED_CONDOMINIO_KEY);

    // Resetear estado
    this.authState$.next(this.getInitialState());
  }

  refreshTokens(): Observable<AuthTokens> {
    const refreshToken = this.getRefreshToken();

    return this.http.post<AuthTokens>(
      `${this.API_URL}/refresh`,
      { refreshToken }
    ).pipe(
      tap(tokens => {
        localStorage.setItem(this.TOKEN_KEY, tokens.accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);

        const currentState = this.authState$.value;
        this.authState$.next({
          ...currentState,
          tokens
        });
      })
    );
  }

  clearAllData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.CONDOMINIOS_KEY);
    localStorage.removeItem(this.SELECTED_CONDOMINIO_KEY);
    this.authState$.next(this.getInitialState());
  }
}
