import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PSB_BASE_URL = Deno.env.get("PSB_BASE_URL") || "https://baastest.9psb.com.ng/iva-api/v1/merchant/virtualaccount";
const PSB_PUBLIC_KEY = Deno.env.get("PSB_PUBLIC_KEY")!;
const PSB_PRIVATE_KEY = Deno.env.get("PSB_PRIVATE_KEY")!;

interface VirtualAccountRequest {
  amount: number;
  userId: string;
  userName: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body: VirtualAccountRequest = await req.json();
    const { amount, userName } = body;

    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const authResponse = await fetch(`${PSB_BASE_URL}/authenticate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        publickey: PSB_PUBLIC_KEY,
        privatekey: PSB_PRIVATE_KEY,
      }),
    });

    if (!authResponse.ok) {
      throw new Error("Failed to authenticate with 9PSB");
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    if (!accessToken) {
      throw new Error("No access token received from 9PSB");
    }

    const reference = `SQ${Date.now()}${user.id.substring(0, 8)}`;

    const createAccountResponse = await fetch(`${PSB_BASE_URL}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        transaction: {
          reference: reference,
        },
        order: {
          amount: amount,
          currency: "NGN",
          description: "Sports Quiz Wallet Funding",
          country: "NGA",
          amounttype: "EXACT",
        },
        customer: {
          account: {
            name: userName,
            type: "DYNAMIC",
            expiry: {
              hours: 1,
            },
          },
        },
      }),
    });

    if (!createAccountResponse.ok) {
      const errorText = await createAccountResponse.text();
      console.error("9PSB API error:", errorText);
      throw new Error("Failed to create virtual account");
    }

    const accountData = await createAccountResponse.json();

    if (accountData.code !== "00") {
      throw new Error(accountData.message || "Failed to create virtual account");
    }

    const { data: insertError } = await supabase
      .from("payment_transactions")
      .insert([
        {
          user_id: user.id,
          reference: reference,
          amount: amount,
          status: "pending",
          virtual_account_number: accountData.customer.account.number,
          virtual_account_name: accountData.customer.account.name,
          virtual_account_bank: accountData.customer.account.bank,
          expires_at: accountData.customer.account.expiry.date,
        },
      ]);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          accountNumber: accountData.customer.account.number,
          accountName: accountData.customer.account.name,
          bankName: accountData.customer.account.bank,
          amount: amount,
          reference: reference,
          expiresAt: accountData.customer.account.expiry.date,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating virtual account:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to create virtual account",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});