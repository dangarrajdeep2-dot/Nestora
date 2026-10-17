import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function validatePhoneNumber(phone: string | null | undefined): {
  isValid: boolean;
  error: string | null;
} {
  // Empty phone is accepted because phone is optional
  if (phone === null || phone === undefined || phone === '') {
    return { isValid: true, error: null };
  }

  // Reject country codes or '+'
  if (phone.includes('+')) {
    return {
      isValid: false,
      error: 'Please enter a 10-digit number without country code (+91) or "+".',
    };
  }

  // Reject spaces
  if (/\s/.test(phone)) {
    return {
      isValid: false,
      error: 'Phone number cannot contain spaces. Enter 10 digits without spaces.',
    };
  }

  // Reject letters
  if (/[a-zA-Z]/.test(phone)) {
    return {
      isValid: false,
      error: 'Phone number cannot contain letters. Only numeric digits (0–9) are allowed.',
    };
  }

  // Reject special characters / punctuation
  if (/[^0-9]/.test(phone)) {
    return {
      isValid: false,
      error: 'Phone number cannot contain special characters. Only numeric digits (0–9) are allowed.',
    };
  }

  // Reject numbers with fewer than 10 digits
  if (phone.length < 10) {
    return {
      isValid: false,
      error: `Phone number must be exactly 10 digits (${phone.length}/10 entered).`,
    };
  }

  // Reject numbers with more than 10 digits
  if (phone.length > 10) {
    return {
      isValid: false,
      error: `Phone number must be exactly 10 digits (${phone.length} digits entered).`,
    };
  }

  return { isValid: true, error: null };
}
