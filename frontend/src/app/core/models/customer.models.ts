export interface CustomerCreateRequest {
  ccode: string;
  cname: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  mobileNumber: string;
  email: string;
  gstNo: string;
  panNo: string;
  bankName: string;
  branchName: string;
  accountNo: string;
}

export interface CustomerCreateResponse {
  ccode: string;
}

export interface CustomerSummaryResponse {
  cid: number;
  ccode: string;
  cname: string;
  city: string;
  state: string;
  mobileNumber: string;
  email: string;
  createdAt: string; // ISO string from backend
}

export interface CustomerDetailResponse {
  cid: number;
  ccode: string;
  cname: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  mobileNumber: string;
  email: string;
  gstNo: string;
  panNo: string;
  bankName: string;
  branchName: string;
  accountNo: string;
  createdAt: string; // ISO string
}

export interface AvailabilityResponse {
  available: boolean;
}

export interface CustomerUpdateRequest {
  cname: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  mobileNumber: string;
  email: string;
  gstNo: string;
  panNo: string;
  bankName: string;
  branchName: string;
  accountNo: string;
}