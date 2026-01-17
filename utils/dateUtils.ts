
import { ProductStatus } from '../types';

export const calculateDaysToExpiry = (expiryDate: string): number => {
  if (!expiryDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getStatusFromDays = (days: number): ProductStatus => {
  if (days < 0) return ProductStatus.EXPIRED;
  if (days <= 35) return ProductStatus.CRITICAL;
  return ProductStatus.SAFE;
};
