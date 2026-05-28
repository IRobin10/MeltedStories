import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export async function POST(req: Request) {
  try {
    const { id, status, email, skipDbUpdate } = await req.json();

    // Get Authorization header to extract Bearer token
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

    // Create a request-scoped Supabase client
    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    if (token) {
      await supabaseClient.auth.setSession({ access_token: token, refresh_token: "" });
    }

    // 1. Update the order in the database
    if (!skipDbUpdate) {
      const { data, error } = await supabaseClient
        .from("orders")
        .update({ status })
        .eq("id", id)
        .select();

      if (error) {
        console.error("Supabase update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data || data.length === 0) {
        console.warn(`No rows updated for order ${id}. RLS might have blocked it or order not found.`);
        return NextResponse.json({ error: "Order not found or update not authorized by RLS policy." }, { status: 403 });
      }

      console.log(`Order ${id} updated to status: ${status} in database`);
    } else {
      console.log(`Order ${id} database update skipped (updated on client)`);
    }

    // 2. Send Email notification if order is marked ready
    if (status === "ready" && email) {
      const smtpEmail = process.env.SMTP_EMAIL;
      const smtpPassword = process.env.SMTP_PASSWORD;

      if (!smtpEmail || !smtpPassword) {
        console.log(`[MOCK EMAIL] To: ${email} | Subject: Your Melted Stories Order is Ready! 🎉`);
        console.log(`[MOCK EMAIL BODY] Order ID: ${id.slice(0, 8)} is ready for pickup.`);
      } else {
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: smtpEmail,
              pass: smtpPassword,
            },
          });

          await transporter.sendMail({
            from: `"Melted Stories" <${smtpEmail}>`,
            to: email,
            subject: `Your Melted Stories Order is Ready! 🎉`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #fdf8f0; border: 1px solid #e8c87a; border-radius: 16px; color: #3d2314;">
                <h1 style="color: #c9a253; text-align: center; font-size: 24px;">Melted Stories</h1>
                <hr style="border: 1px solid rgba(201,162,83,0.3); margin: 16px 0;">
                <h2 style="color: #166534; text-align: center;">Your Order is Ready! ✅</h2>
                <p style="color: rgba(100,60,30,0.8); text-align: center; font-size: 14px;">
                  Order ID: <strong style="color: #3d2314;">${id.slice(0, 8)}</strong>
                </p>
                <p style="color: rgba(100,60,30,0.8); text-align: center; font-size: 16px; margin-top: 16px;">
                  Please head to the counter to pick up your order.
                </p>
                <div style="text-align: center; margin-top: 24px;">
                  <span style="background: #c9a253; color: #fdf8f0; padding: 12px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    Show this email at pickup
                  </span>
                </div>
                <p style="color: rgba(100,60,30,0.55); text-align: center; font-size: 12px; margin-top: 24px;">
                  Thank you for choosing Melted Stories ❤️
                </p>
              </div>
            `,
          });

          console.log(`✅ Email sent successfully to ${email}`);
        } catch (emailError: any) {
          console.error(`❌ Email failed: ${emailError.message}`);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order Update API Error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
