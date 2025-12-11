const PSB_BASE_URL = "https://baastest.9psb.com.ng/iva-api/v1/merchant/virtualaccount";

interface AuthResponse {
  access_token: string | null;
  expires_in: number;
  code: string;
  message: string;
}

interface VirtualAccountRequest {
  amount: number;
  customerName: string;
  reference: string;
  description?: string;
}

interface VirtualAccountResponse {
  code: string;
  message: string;
  transaction?: {
    reference: string;
  };
  order?: {
    amount: number;
    currency: string;
    description: string;
    country: string;
    amounttype: string;
  };
  customer?: {
    account: {
      name: string;
      type: string;
      expiry: {
        hours: number;
        date: string;
      } | null;
      number: string;
      bank: string;
    };
  };
}

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

export async function authenticate(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  const publicKey = process.env.PSB_PUBLIC_KEY;
  const privateKey = process.env.PSB_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error("9PSB API credentials not configured");
  }

  const response = await fetch(`${PSB_BASE_URL}/authenticate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      publickey: publicKey,
      privatekey: privateKey,
    }),
  });

  const data = await response.json() as AuthResponse;

  if (data.code !== "00" || !data.access_token) {
    throw new Error(`9PSB Authentication failed: ${data.message}`);
  }

  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

  return cachedToken;
}

export async function createVirtualAccount(
  request: VirtualAccountRequest
): Promise<VirtualAccountResponse> {
  const token = await authenticate();

  const payload = {
    transaction: {
      reference: request.reference,
    },
    order: {
      amount: request.amount,
      currency: "NGN",
      description: request.description || "Wallet Funding",
      country: "NGA",
      amounttype: "EXACT",
    },
    customer: {
      account: {
        name: request.customerName,
        type: "DYNAMIC",
        expiry: {
          hours: 1,
        },
      },
    },
  };

  const response = await fetch(`${PSB_BASE_URL}/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json() as VirtualAccountResponse;

  if (data.code !== "00") {
    throw new Error(`Failed to create virtual account: ${data.message}`);
  }

  return data;
}

export async function confirmPayment(reference: string): Promise<any> {
  const token = await authenticate();

  const response = await fetch(`${PSB_BASE_URL}/status/${reference}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { rawResponse: text, parseError: true };
  }
}

interface ReallocateRequest {
  accountNumber: string;
  newReference: string;
  amount: number;
  customerName: string;
  description?: string;
}

export async function reallocateVirtualAccount(
  request: ReallocateRequest
): Promise<VirtualAccountResponse> {
  const token = await authenticate();

  const payload = {
    transaction: {
      reference: request.newReference,
    },
    order: {
      amount: request.amount,
      currency: "NGN",
      description: request.description || "Wallet Funding",
      country: "NGA",
      amounttype: "EXACT",
    },
    customer: {
      account: {
        name: request.customerName,
        number: request.accountNumber,
        expiry: {
          hours: 1,
        },
      },
    },
  };

  const response = await fetch(`${PSB_BASE_URL}/reallocate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json() as VirtualAccountResponse;

  if (data.code !== "00") {
    throw new Error(`Failed to reallocate virtual account: ${data.message}`);
  }

  return data;
}

export async function deactivateVirtualAccount(accountNumber: string): Promise<any> {
  const token = await authenticate();

  const response = await fetch(`${PSB_BASE_URL}/deactivate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      customer: {
        account: {
          number: accountNumber,
        },
      },
    }),
  });

  const data = await response.json();

  if (data.code !== "00") {
    throw new Error(`Failed to deactivate virtual account: ${data.message}`);
  }

  return data;
}

export async function reactivateVirtualAccount(accountNumber: string): Promise<any> {
  const token = await authenticate();

  const response = await fetch(`${PSB_BASE_URL}/reactivate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      customer: {
        account: {
          number: accountNumber,
        },
      },
    }),
  });

  const data = await response.json();

  if (data.code !== "00") {
    throw new Error(`Failed to reactivate virtual account: ${data.message}`);
  }

  return data;
}
