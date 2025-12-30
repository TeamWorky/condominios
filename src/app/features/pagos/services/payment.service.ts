import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IPayment } from '../../../core/models/payment.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  getPayments(): Observable<IPayment[]> {
    return this.http.get<IPayment[]>(this.apiUrl);
  }

  getPaymentById(id: string): Observable<IPayment> {
    return this.http.get<IPayment>(`${this.apiUrl}/${id}`);
  }

  getPaymentsByResident(residentId: string): Observable<IPayment[]> {
    return this.http.get<IPayment[]>(`${this.apiUrl}?residentId=${residentId}`);
  }

  getPaymentsByUnit(unitNumber: string): Observable<IPayment[]> {
    return this.http.get<IPayment[]>(`${this.apiUrl}?unitNumber=${unitNumber}`);
  }

  createPayment(payment: Omit<IPayment, 'id' | 'createdAt' | 'updatedAt'>): Observable<IPayment> {
    return this.http.post<IPayment>(this.apiUrl, {
      ...payment,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  updatePayment(id: string, payment: Partial<IPayment>): Observable<IPayment> {
    return this.http.patch<IPayment>(`${this.apiUrl}/${id}`, {
      ...payment,
      updatedAt: new Date()
    });
  }

  deletePayment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
