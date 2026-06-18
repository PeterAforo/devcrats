export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ESTATE_MANAGER = 'estate_manager',
  LANDLORD = 'landlord',
  TENANT = 'tenant',
  SECURITY_STAFF = 'security_staff',
  MAINTENANCE_STAFF = 'maintenance_staff',
  VIEWER = 'viewer',
}

export enum UnitStatus {
  VACANT = 'vacant',
  OCCUPIED = 'occupied',
  UNDER_MAINTENANCE = 'under_maintenance',
  RESERVED = 'reserved',
}

export enum UnitType {
  STUDIO = 'studio',
  ONE_BED = 'one_bed',
  TWO_BED = 'two_bed',
  THREE_BED = 'three_bed',
  PENTHOUSE = 'penthouse',
  COMMERCIAL = 'commercial',
}

export enum LeaseStatus {
  DRAFT = 'draft',
  PENDING_SIGNATURE = 'pending_signature',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  RENEWED = 'renewed',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_PAID = 'partially_paid',
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum ChargeType {
  FIXED = 'fixed',
  PER_UNIT = 'per_unit',
  PER_SQFT = 'per_sqft',
  PERCENTAGE_OF_RENT = 'percentage_of_rent',
  TIERED = 'tiered',
}

export enum FeeComponentCategory {
  UTILITY = 'utility',
  SECURITY = 'security',
  CLEANING = 'cleaning',
  ADMINISTRATION = 'administration',
  INSURANCE = 'insurance',
  RESERVE_FUND = 'reserve_fund',
  AMENITY = 'amenity',
  INFRASTRUCTURE = 'infrastructure',
  SPECIAL_LEVY = 'special_levy',
}

export enum BillingFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUALLY = 'semi_annually',
  ANNUALLY = 'annually',
  ONE_TIME = 'one_time',
}

export enum ServiceRequestStatus {
  SUBMITTED = 'submitted',
  ACKNOWLEDGED = 'acknowledged',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  PENDING_APPROVAL = 'pending_approval',
  COMPLETED = 'completed',
  CLOSED = 'closed',
}

export enum ServiceRequestPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low',
}

export enum ServiceRequestCategory {
  PLUMBING = 'plumbing',
  ELECTRICAL = 'electrical',
  STRUCTURAL = 'structural',
  APPLIANCE = 'appliance',
  PEST_CONTROL = 'pest_control',
  HVAC = 'hvac',
  GENERAL = 'general',
  EMERGENCY = 'emergency',
}

export enum ComplaintStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  ACTION_TAKEN = 'action_taken',
  PENDING_CLOSURE = 'pending_closure',
  CLOSED = 'closed',
}

export enum ComplaintCategory {
  NOISE = 'noise',
  PLUMBING = 'plumbing',
  SECURITY = 'security',
  NEIGHBOR_DISPUTE = 'neighbor_dispute',
  MANAGEMENT_ISSUE = 'management_issue',
  BILLING = 'billing',
  STRUCTURAL = 'structural',
  PEST = 'pest',
  FACILITY = 'facility',
  STAFF_BEHAVIOR = 'staff_behavior',
  OTHER = 'other',
}

export enum NotificationType {
  RENT_DUE = 'rent_due',
  RENT_OVERDUE = 'rent_overdue',
  EMF_DUE = 'emf_due',
  LEASE_EXPIRY = 'lease_expiry',
  MAINTENANCE_UPDATE = 'maintenance_update',
  COMPLAINT_UPDATE = 'complaint_update',
  VISITOR_ARRIVAL = 'visitor_arrival',
  EMERGENCY_BROADCAST = 'emergency_broadcast',
  FEE_CHANGE_NOTICE = 'fee_change_notice',
  DOCUMENT_READY = 'document_ready',
  PAYMENT_RECEIPT = 'payment_receipt',
  EVICTION_NOTICE = 'eviction_notice',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  PUSH = 'push',
}

export enum StaffRole {
  SECURITY_GUARD = 'security_guard',
  CLEANER = 'cleaner',
  ELECTRICIAN = 'electrician',
  PLUMBER = 'plumber',
  FACILITY_MANAGER = 'facility_manager',
  RECEPTIONIST = 'receptionist',
  GATE_OFFICER = 'gate_officer',
}

export enum VisitorPurpose {
  PERSONAL = 'personal',
  DELIVERY = 'delivery',
  MAINTENANCE = 'maintenance',
  BUSINESS = 'business',
  EMERGENCY = 'emergency',
  OTHER = 'other',
}

export enum UtilityType {
  ELECTRICITY = 'electricity',
  WATER = 'water',
  GAS = 'gas',
  INTERNET = 'internet',
  WASTE_COLLECTION = 'waste_collection',
}

export enum DocumentType {
  LEASE_AGREEMENT = 'lease_agreement',
  ID_DOCUMENT = 'id_document',
  PROOF_OF_INCOME = 'proof_of_income',
  MOVE_IN_REPORT = 'move_in_report',
  NOTICE_LETTER = 'notice_letter',
  POLICY_DOCUMENT = 'policy_document',
  VENDOR_CONTRACT = 'vendor_contract',
  INSURANCE_CERTIFICATE = 'insurance_certificate',
  INSPECTION_REPORT = 'inspection_report',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  CARD = 'card',
  MOBILE_MONEY = 'mobile_money',
  CASH = 'cash',
}

export enum FeeScheduleStatus {
  DRAFT = 'draft',
  NOTICE_PUBLISHED = 'notice_published',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum IdType {
  GHANA_CARD = 'ghana_card',
  PASSPORT = 'passport',
}

export enum OccupancyType {
  SELF_OCCUPIED = 'self_occupied',
  RENTED = 'rented',
}

export enum ChangeRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}
