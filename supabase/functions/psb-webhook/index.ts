import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PSB_BASE_URL = "https://baastest.9psb.com.ng/iva-api/v1/merchant/virtualaccount";
const PSB_PUBLIC_KEY = "5DC6CF5DCDF049CAB9ABA91099DACF83";
const PSB_PRIVATE_KEY = "OyVxqDeDeXtDRzTSyJSZ1qUUOJTKKNLNl3zL05usNyGNbytCyfgi1-t7QMN3pkyA";

async function sha512(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-512", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("").toUpperCase();
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

    const payload = await req.json();
    console.log("Received webhook payload:", JSON.stringify(payload, null, 2));

    const {
      transaction,
      customer,
      order,
      hash: receivedHash,
    } = payload;

    const senderAccountNumber = customer.account.senderaccountnumber;
    const senderBankCode = customer.account.senderbankcode;
    const virtualAccountNumber = customer.account.number;
    const transactionAmount = order.amount.toFixed(2);

    const expectedHashInput = `${PSB_PRIVATE_KEY}${senderAccountNumber}${senderBankCode}${virtualAccountNumber}${transactionAmount}`;
    const expectedHash = await sha512(expectedHashInput);

    if (receivedHash !== expectedHash) {
      console.error("Hash mismatch. Webhook request rejected.");
      return new Response(
        JSON.stringify({ code: "47", message: "Invalid hash" }),
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

    const confirmResponse = await fetch(`${PSB_BASE_URL}/confirmpayment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        sessionid: transaction.sessionid,
        amount: order.amount,
        accountnumber: virtualAccountNumber,
      }),
    });

    if (!confirmResponse.ok) {
      throw new Error("Failed to confirm payment");
    }

    const confirmData = await confirmResponse.json();

    if (confirmData.code !== "00" || !confirmData.transactions || confirmData.transactions.length === 0) {
      console.error("Payment confirmation failed:", confirmData);
      return new Response(
        JSON.stringify({ code: "47", message: "Payment not confirmed" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: paymentTxn, error: fetchError } = await supabase
      .from("payment_transactions")
      .select("*")
      .eq("virtual_account_number", virtualAccountNumber)
      .eq("status", "pending")
      .maybeSingle();

    if (fetchError || !paymentTxn) {
      console.error("Payment transaction not found");
      return new Response(
        JSON.stringify({ code: "00", message: "Success" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { error: updateError } = await supabase
      .from("payment_transactions")
      .update({
        status: "completed",
        session_id: transaction.sessionid,
        completed_at: new Date().toISOString(),
      })
      .eq("id", paymentTxn.id);

    if (updateError) {
      console.error("Failed to update payment transaction:", updateError);
    }

    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", paymentTxn.user_id)
      .maybeSingle();

    if (walletError || !wallet) {
      console.error("Wallet not found for user:", paymentTxn.user_id);
      return new Response(
        JSON.stringify({ code: "00", message: "Success" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const newBalance = wallet.balance + order.amount;
    const newTotalFunded = wallet.total_funded + order.amount;

    const { error: walletUpdateError } = await supabase
      .from("wallets")
      .update({
        balance: newBalance,
        total_funded: newTotalFunded,
        updated_at: new Date().toISOString(),
      })
      .eq("id", wallet.id);

    if (walletUpdateError) {
      console.error("Failed to update wallet:", walletUpdateError);
    }

    const { error: transactionError } = await supabase
      .from("wallet_transactions")
      .insert([
        {
          wallet_id: wallet.id,
          type: "funding",
          amount: order.amount,
          description: `Payment via 9PSB - ${transaction.sessionid}`,
          reference: paymentTxn.reference,
        },
      ]);

    if (transactionError) {
      console.error("Failed to create wallet transaction:", transactionError);
    }

    return new Response(
      JSON.stringify({ code: "00", message: "Success" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ code: "99", message: "Request processing error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});