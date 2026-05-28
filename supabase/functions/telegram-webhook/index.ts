// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// const telegramBotToken = Deno.env.get("TELEGRAM_BOT_TOKEN") || "8905275308:AAEc5D1viH9jXmErFEZ96EDK8U7Wr9fTE-I";
// // Using the token directly as a fallback just in case env is not set

// serve(async (req) => {
//   try {
//     const supabaseUrl = Deno.env.get("SUPABASE_URL");
//     const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

//     if (!supabaseUrl || !supabaseKey) {
//       throw new Error("Missing Supabase credentials");
//     }

//     const supabase = createClient(supabaseUrl, supabaseKey);

//     const body = await req.json();
//     const text = body.message?.text || "";
//     const chatId = body.message?.chat?.id;

//     if (text) {
//       // Look for an amount in the message
//       // Examples: "credited with 500", "Rs 500", "INR 500", "paid 500"
//       const textLower = text.toLowerCase();
//       let amountMatch = textLower.match(/credited with\s*(?:rs\.?|inr|₹)?\s*(\d+)/) || 
//                         textLower.match(/(?:rs\.?|inr|₹)\s*(\d+)/) ||
//                         textLower.match(/received\s*(?:rs\.?|inr|₹)?\s*(\d+)/) ||
//                         textLower.match(/paid\s*(?:rs\.?|inr|₹)?\s*(\d+)/);
      
//       if (amountMatch) {
//         const amount = parseInt(amountMatch[1], 10);
        
//         // Find the most recent pending order with this amount
//         const { data: pendingOrders, error } = await supabase
//           .from("orders")
//           .select("*")
//           .eq("status", "pending")
//           .order("created_at", { ascending: false });
          
//         if (error) {
//           console.error("DB Error:", error);
//           throw error;
//         }

//         const matchedOrder = pendingOrders?.find(o => Number(o.total_amount) === amount);

//         if (matchedOrder) {
//           // Update the order status to "paid"
//           await supabase
//             .from("orders")
//             .update({ status: "paid" })
//             .eq("id", matchedOrder.id);

//           // Send confirmation back to Telegram
//           await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               chat_id: chatId,
//               text: `✅ Order #${matchedOrder.id.slice(0, 8)} marked as PAID. Amount: ₹${matchedOrder.total_amount}`
//             })
//           });
//         } else {
//           // No pending order matched the amount
//           await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({
//               chat_id: chatId,
//               text: `⚠️ No pending order found for amount: ₹${amount}`
//             })
//           });
//         }
//       } else {
//         // Did not find an amount in the text
//         // If it's a completely unrelated message, we can just ignore or send a help text
//       }
//     }

//     return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
//   } catch (error: any) {
//     console.error("Webhook Error:", error);
//     return new Response(JSON.stringify({ error: error.message }), { status: 400 });
//   }
// });
