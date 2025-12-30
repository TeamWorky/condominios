export interface IPayment {
  id: string;
  unitNumber: string;
  residentId: string;
  residentName: string;
  amount: number;
  period: string; // YYYY-MM format
  dueDate: Date;
  paidDate?: Date;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  reference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  PARTIAL = 'PARTIAL',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  CHECK = 'CHECK',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD'
}

export interface ICommonExpense {
  id: string;
  period: string; // YYYY-MM format
  basicAmount: number;
  waterAmount?: number;
  gasAmount?: number;
  parkingAmount?: number;
  otherCharges?: number;
  totalAmount: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreatePaymentDto {
  unitNumber: string;
  residentId: string;
  amount: number;
  period: string;
  dueDate: Date;
  notes?: string;
}

export interface IRegisterPaymentDto {
  paymentId: string;
  paidDate: Date;
  paymentMethod: PaymentMethod;
  reference?: string;
}
