import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { amount, currency = "INR", receipt } = await req.json();

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;

    // Create Razorpay order using REST API (no npm package needed)
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Razorpay expects paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("Razorpay order creation failed:", errData);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    const order = await response.json();
    return NextResponse.json(order);
  } catch (error) {
    console.error("Razorpay create order error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
