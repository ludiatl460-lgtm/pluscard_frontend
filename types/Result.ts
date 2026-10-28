export type Gender = "MALE" | "FEMALE";

export type ReconcileStatus = 
  | "MATCHED"
  | "AMOUNT_MISMATCH"
  | "PARTIAL_MATCH"
  | "ONLY_IN_FRONTEND"
  | "ONLY_IN_BACKEND";

export interface ReconcliledBy {
  id: string;
  name: string;
  lastname?: string;
  gender: Gender;
  contact: string;
  email?: string;
}

export interface FrontEndFile {
  cardType: string;
  transactionDateTime: string;
  merchantId: string;
  merchantName: string;
  Shift: string;
  terminalId: string;
  cardNumber: string;
  vehicleLicense: string;
  product: string;
  priceLiter: number;
  numberOfLiters: number;
  total: number;
  status: string;
  approveCode: string;
  referenceNumber: string;
}

export interface BackEndFile {
  no: number;
  system: string;
  cardType: string;
  cardGrade: string;
  cutOfDate: string;
  transactionDateTime: string;
  setteldDateTime: string;
  merchant: string;
  merchantName: string;
  terminal: string;
  customer: string;
  customerEngName: string;
  customerLaoName: string;
  seq: number;
  card: string;
  vehicalLicense: string;
  product: string;
  productType: string;
  priceLiter: number;
  numberOfLiters: number;
  amount: number;
  transactionStatus: string;
  previousOdo: string;
  odoMeter: string;
  distance: string;
  consumption: string;
  invoice: string;
  reference: string;
  approveCode: string;
  endpoint: string;
  responseCode: string;
  errorCode: string;
}

export interface Reconciliation {
  reconcileCode: string;
  frontend?: FrontEndFile | null;
  backend?: BackEndFile | null;
  status: ReconcileStatus;
}

export interface Result {
  id?: string;
  manageBy: ReconcliledBy;
  items: Reconciliation[];
  createdAt: string;
}

