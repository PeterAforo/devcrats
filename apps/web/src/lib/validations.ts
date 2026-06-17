import { z } from 'zod';

// ─── AUTH ─────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ─── ESTATES ──────────────────────────────────────────────
export const estateSchema = z.object({
  name: z.string().min(3, 'Estate name is required').max(200),
  address: z.string().min(5, 'Address is required'),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('Ghana'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  description: z.string().optional(),
  currency: z.string().default('GHS'),
});

// ─── TENANTS ──────────────────────────────────────────────
export const tenantSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  estateId: z.string().uuid(),
  unitId: z.string().uuid(),
  landlordId: z.string().uuid(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  nationality: z.string().optional(),
  tenantType: z.enum(['single', 'family', 'company']).optional(),
  occupants: z.number().min(1).optional(),
  companyName: z.string().optional(),
  leaseStartDate: z.string().min(1, 'Start date required'),
  leaseEndDate: z.string().min(1, 'End date required'),
  rentAmount: z.number().min(0).optional(),
  depositAmount: z.number().min(0).optional(),
});

// ─── LANDLORDS ────────────────────────────────────────────
export const landlordSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  estateId: z.string().uuid(),
  bankName: z.string().optional(),
  bankAccountNo: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankCode: z.string().optional(),
});

// ─── PAYMENTS ─────────────────────────────────────────────
export const paymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  method: z.enum(['bank_transfer', 'card', 'mobile_money', 'cash']),
  reference: z.string().optional(),
  gateway: z.string().optional(),
});

export const invoiceSchema = z.object({
  estateId: z.string().uuid(),
  unitId: z.string().uuid().optional(),
  type: z.string().min(1),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, 'Description required'),
    quantity: z.number().min(1).default(1),
    unitPrice: z.number().min(0.01, 'Price must be greater than 0'),
  })).min(1, 'At least one item is required'),
});

// ─── MAINTENANCE ──────────────────────────────────────────
export const maintenanceSchema = z.object({
  estateId: z.string().uuid(),
  unitId: z.string().uuid().optional(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Provide more detail'),
  category: z.string().min(1, 'Select a category'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
});

// ─── COMPLAINTS ───────────────────────────────────────────
export const complaintSchema = z.object({
  estateId: z.string().uuid(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Provide more detail'),
  category: z.string().min(1, 'Select a category'),
  urgency: z.enum(['low', 'normal', 'high']).optional(),
  isAnonymous: z.boolean().optional(),
});

// ─── VISITORS ─────────────────────────────────────────────
export const visitorInviteSchema = z.object({
  estateId: z.string().uuid(),
  tenantId: z.string().uuid(),
  visitorName: z.string().min(2, 'Visitor name is required'),
  visitorPhone: z.string().optional(),
  purpose: z.string().min(3, 'Purpose is required'),
  expectedArrival: z.string().min(1, 'Expected arrival is required'),
  duration: z.string().optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type EstateInput = z.infer<typeof estateSchema>;
export type TenantInput = z.infer<typeof tenantSchema>;
export type LandlordInput = z.infer<typeof landlordSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type MaintenanceInput = z.infer<typeof maintenanceSchema>;
export type ComplaintInput = z.infer<typeof complaintSchema>;
export type VisitorInviteInput = z.infer<typeof visitorInviteSchema>;
