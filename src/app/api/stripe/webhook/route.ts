import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type Stripe from "stripe";

async function buffer(readable: Readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export async function POST(req: NextRequest) {
    const sig = req.headers.get("stripe-signature");
    const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !WEBHOOK_SECRET) {
        console.error("Webhook Error: Missing Stripe signature or webhook secret.");
        return NextResponse.json({
            error: "No Stripe signature or webhook secret.",
        }, { status: 400 });
    }

    let event: Stripe.Event;
    const buf = await buffer(req.body as unknown as Readable);

    try {
        event = stripe.webhooks.constructEvent(buf, sig, WEBHOOK_SECRET);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error
            ? err.message
            : "Unknown error during webhook construction";
        console.error(`Webhook Error: ${errorMessage}`);
        return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, {
            status: 400,
        });
    }

    switch (event.type) {
        case "payment_intent.succeeded":
            const paymentIntentSucceeded = event.data
                .object as Stripe.PaymentIntent;
            console.log(
                `PaymentIntent for ${paymentIntentSucceeded.amount} was succeeded! (ID: ${paymentIntentSucceeded.id})`,
            );

            const orderIdSucceeded = paymentIntentSucceeded.metadata?.order_id;
            if (orderIdSucceeded) {
                const { error: orderError } = await supabaseAdmin
                    .from("orders")
                    .update({
                        order_status: "processing",
                        payment_status: "paid",
                    })
                    .eq("id", orderIdSucceeded);

                if (orderError) {
                    console.error(
                        `Error updating order ${orderIdSucceeded} on PI success:`,
                        orderError.message,
                    );
                }

                const { error: transactionError } = await supabaseAdmin
                    .from("transactions")
                    .update({
                        transaction_status: "succeeded",
                    })
                    .eq("gateway_transaction_id", paymentIntentSucceeded.id);

                if (transactionError) {
                    console.error(
                        `Error updating transaction for PI ${paymentIntentSucceeded.id} on success:`,
                        transactionError.message,
                    );
                }
            }
            break;

        case "payment_intent.payment_failed":
            const paymentIntentFailed = event.data
                .object as Stripe.PaymentIntent;
            console.log(
                `PaymentIntent for ${paymentIntentFailed.amount} failed: ${paymentIntentFailed.last_payment_error?.message} (ID: ${paymentIntentFailed.id})`,
            );

            const orderIdFailed = paymentIntentFailed.metadata?.order_id;
            if (orderIdFailed) {
                const { error: orderError } = await supabaseAdmin
                    .from("orders")
                    .update({
                        order_status: "cancelled",
                        payment_status: "failed",
                    })
                    .eq("id", orderIdFailed);

                if (orderError) {
                    console.error(
                        `Error updating order ${orderIdFailed} on PI failure:`,
                        orderError.message,
                    );
                }

                const { error: transactionError } = await supabaseAdmin
                    .from("transactions")
                    .update({
                        transaction_status: "failed",
                        error_message:
                            paymentIntentFailed.last_payment_error?.message ||
                            "Payment failed",
                    })
                    .eq("gateway_transaction_id", paymentIntentFailed.id);

                if (transactionError) {
                    console.error(
                        `Error updating transaction for PI ${paymentIntentFailed.id} on failure:`,
                        transactionError.message,
                    );
                }
            }
            break;

        case "charge.refunded":
            const chargeRefunded = event.data.object as Stripe.Charge;
            console.log(`Charge ${chargeRefunded.id} was refunded.`);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
}
