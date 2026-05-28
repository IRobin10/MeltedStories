import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const keySecret = process.env.RAZORPAY_KEY_SECRET!;

    // Verify signature using HMAC SHA256
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (isValid) {
      return NextResponse.json({ verified: true, paymentId: razorpay_payment_id });
    } else {
      return NextResponse.json({ verified: false, error: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Razorpay verify error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
