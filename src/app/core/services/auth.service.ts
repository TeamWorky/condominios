import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
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
      // NO cargar condominios desde localStorage (testing mode)
      const selectedCondominioData = localStorage.getItem(this.SELECTED_CONDOMINIO_KEY);

      console.log('🔍 [AuthService] Loading stored state (NO condominios from localStorage):', {
        hasAccessToken: !!accessToken,
        hasUserData: !!userData
      });

      // Validar que los datos no sean null, undefined, o strings 'undefined'/'null'
      if (accessToken && userData && userData !== 'undefined' && userData !== 'null') {
        // NO cargar condominios desde localStorage - siempre empezar vacío
        this.authState$.next({
          user: JSON.parse(userData),
          condominios: [], // Siempre vacío al cargar desde localStorage
          selectedCondominio: selectedCondominioData && selectedCondominioData !== 'undefined' && selectedCondominioData !== 'null' ? JSON.parse(selectedCondominioData) : null,
          tokens: { accessToken, refreshToken: refreshToken || '' },
          isAuthenticated: true
        });
        console.log('🔍 [AuthService] Loaded state WITHOUT condominios (will be set on login)');
      }
    } catch (error) {
      // Si hay error parseando, limpiar el localStorage
      console.error('Error loading stored auth state, clearing localStorage:', error);
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
    return this.http.post<{ success: boolean; data: LoginResponse }>(`${this.API_URL}/login`, credentials)
      .pipe(
        tap(fullResponse => {
          console.log('🔍 [AuthService] Full backend response:', fullResponse);
          console.log('🔍 [AuthService] Full response condominios:', fullResponse.data?.condominios);
          console.log('🔍 [AuthService] Full response condominios count:', fullResponse.data?.condominios?.length);
          console.log('🔍 [AuthService] Full response condominios names:', fullResponse.data?.condominios?.map((c: any) => c?.name));
        }),
        map(response => {
          console.log('🔍 [AuthService] Mapping response.data:', response.data);
          console.log('🔍 [AuthService] Response.data.condominios:', response.data?.condominios);
          console.log('🔍 [AuthService] Response.data.condominios count:', response.data?.condominios?.length);
          console.log('🔍 [AuthService] Response.data.condominios isArray:', Array.isArray(response.data?.condominios));
          return response.data;
        }),
        tap(data => {
          console.log('🔍 [AuthService] Mapped login data:', {
            userEmail: data.user?.email,
            condominiosCount: data.condominios?.length || 0,
            condominios: data.condominios,
            condominiosIsArray: Array.isArray(data.condominios),
            condominiosNames: data.condominios?.map(c => c.name)
          });
        }),
        tap(data => {
          // Limpiar datos antiguos primero para evitar problemas de caché
          localStorage.removeItem(this.CONDOMINIOS_KEY);
          localStorage.removeItem(this.SELECTED_CONDOMINIO_KEY);

          // Guardar tokens y usuario (pero NO condominios en localStorage para pruebas)
          localStorage.setItem(this.TOKEN_KEY, data.accessToken);
          localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken);
          localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
          
          // NO guardar condominios en localStorage - solo usar el estado
          console.log('🔍 [AuthService] NOT saving condominios to localStorage (testing mode)');
          console.log('🔍 [AuthService] Condominios received from backend:', {
            count: data.condominios?.length || 0,
            names: data.condominios?.map(c => c.name)
          });

          // Asegurarse de que condominios es un array válido
          const condominiosArray = Array.isArray(data.condominios) ? data.condominios : [];
          
          // Actualizar estado - forzar emisión del estado
          const newState = {
            user: data.user,
            condominios: condominiosArray,
            selectedCondominio: null, // No hay condominio seleccionado aún
            tokens: {
              accessToken: data.accessToken,
              refreshToken: data.refreshToken
            },
            isAuthenticated: true
          };
          
          console.log('🔍 [AuthService] Setting new auth state:', {
            condominiosCount: newState.condominios.length,
            condominiosNames: newState.condominios.map(c => c.name),
            condominios: newState.condominios
          });
          
          this.authState$.next(newState);
          
          // Verificar que el estado se actualizó correctamente
          setTimeout(() => {
            const currentState = this.authState$.value;
            console.log('🔍 [AuthService] Verified auth state after update:', {
              condominiosCount: currentState.condominios?.length || 0,
              condominiosNames: currentState.condominios?.map(c => c.name),
              condominios: currentState.condominios
            });
          }, 100);
        })
      );
  }

  selectCondominio(condominioId: string): Observable<SelectCondominioResponse> {
    const request: SelectCondominioRequest = { condominioId };

    return this.http.post<{ success: boolean; data: SelectCondominioResponse }>(
      `${this.API_URL}/select-condominio`,
      request
    ).pipe(
      map(response => response.data),
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
    // Llamar al endpoint de logout (opcional, no bloquea si falla)
    this.http.post(`${this.API_URL}/logout`, {}).subscribe({
      error: () => {
        // Si falla el logout en el servidor, continuar con el logout local
        console.warn('Logout endpoint failed, continuing with local logout');
      }
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

    return this.http.post<{ success: boolean; data: AuthTokens }>(
      `${this.API_URL}/refresh`,
      { refreshToken }
    ).pipe(
      map(response => response.data),
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

  /**
   * Limpia completamente el localStorage y el estado de autenticación
   * Útil para debugging o cuando hay problemas de caché
   */
  clearAllData(): void {
    console.log('🔍 [AuthService] Clearing all auth data');
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.CONDOMINIOS_KEY);
    localStorage.removeItem(this.SELECTED_CONDOMINIO_KEY);
    this.authState$.next(this.getInitialState());
  }
}
