import { supabaseServer } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { items, phone, total, paymentMethod, userId, paymentProof } = await req.json();

    // Insert order — store items as JSON directly in the order row
    const { data: order, error } = await supabaseServer
      .from('orders')
      .insert([
        { 
          customer_email: phone ? `Online Order | Ph: ${phone}` : null, 
          phone_number: phone,
          total_amount: total, 
          payment_method: paymentMethod,
          status: 'pending',
          items: items,
          payment_proof: paymentProof || null,
        }
      ])
      .select()
      .single();

    if (error) {
      // Fallback: try without phone_number if column doesn't exist yet
      if (error.code === '42703' || error.message?.includes('phone_number') || error.message?.includes('schema cache')) {
        const { data: fallbackOrder, error: fallbackError } = await supabaseServer
          .from('orders')
          .insert([
            {
              customer_email: phone ? `Online Order | Ph: ${phone}` : null,
              total_amount: total,
              payment_method: paymentMethod,
              status: 'pending',
              items: items,
              payment_proof: paymentProof || null,
            }
          ])
          .select()
          .single();

        if (fallbackError) {
          console.error("Supabase fallback insert error:", fallbackError);
          return NextResponse.json({ error: fallbackError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, orderId: fallbackOrder.id });
      }

      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error) {
    console.error("Order API Error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
