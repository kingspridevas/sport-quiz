import dotenv from 'dotenv';
dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

interface PaystackResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

interface InitializeTransactionData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface VerifyTransactionData {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message: string | null;
  gateway_response: string;
  paid_at: string | null;
  created_at: string;
  channel: string;
  currency: string;
  customer: {
    id: number;
    email: string;
    customer_code: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  };
  metadata: {
    userId?: string;
    purpose?: string;
    [key: string]: any;
  } | null;
}

export async function initializeTransaction(
  email: string,
  amountInNaira: number,
  callbackUrl: string,
  metadata: { userId: string; purpose: string }
): Promise<PaystackResponse<InitializeTransactionData>> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured');
  }

  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amountInNaira * 100),
      callback_url: callbackUrl,
      metadata: {
        userId: metadata.userId,
        purpose: metadata.purpose,
        custom_fields: [
          {
            display_name: 'User ID',
            variable_name: 'user_id',
            value: metadata.userId,
          },
          {
            display_name: 'Purpose',
            variable_name: 'purpose',
            value: metadata.purpose,
          },
        ],
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to initialize Paystack transaction');
  }

  return data as PaystackResponse<InitializeTransactionData>;
}

export async function verifyTransaction(
  reference: string
): Promise<PaystackResponse<VerifyTransactionData>> {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured');
  }

  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to verify Paystack transaction');
  }

  return data as PaystackResponse<VerifyTransactionData>;
}
