import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendMail, paymentSuccessEmailTemplate, orderConfirmationEmailTemplate } from "@/lib/mailer";
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

                // Send payment success and order confirmation emails
                try {
                    // Fetch order details for emails
                    const { data: orderData, error: fetchOrderError } = await supabaseAdmin
                        .from("orders")
                        .select(`
                            *,
                            users!inner(name, email),
                            order_items(
                                quantity,
                                price,
                                products(name)
                            ),
                            shipping_details(*)
                        `)
                        .eq("id", orderIdSucceeded)
                        .single();

                    if (fetchOrderError || !orderData) {
                        console.error("Error fetching order for email:", fetchOrderError?.message);
                    } else {
                        const userEmail = orderData.users.email;
                        const userName = orderData.users.name || "Valued Customer";
                        
                        // Send payment success email
                        const paymentTemplate = paymentSuccessEmailTemplate({
                            name: userName,
                            amount: paymentIntentSucceeded.amount / 100, // Convert from cents
                            currency: paymentIntentSucceeded.currency.toUpperCase(),
                            transactionId: paymentIntentSucceeded.id,
                            planName: orderData.order_items?.[0]?.products?.name || "Optima AI Service"
                        });

                        await sendMail({
                            to: userEmail,
                            subject: paymentTemplate.subject,
                            html: paymentTemplate.html,
                            text: paymentTemplate.text
                        });

                        // Send order confirmation email
                        const orderItems = orderData.order_items?.map((item: { products?: { name?: string }; quantity: number; price: number }) => ({
                            name: item.products?.name || "Product",
                            quantity: item.quantity,
                            price: item.price
                        })) || [];

                        const shippingAddress = orderData.shipping_details ? {
                            street: orderData.shipping_details.address_line_1 || "",
                            city: orderData.shipping_details.city || "",
                            state: orderData.shipping_details.state || "",
                            zipCode: orderData.shipping_details.postal_code || "",
                            country: orderData.shipping_details.country || ""
                        } : undefined;

                        const orderTemplate = orderConfirmationEmailTemplate({
                            name: userName,
                            orderNumber: orderData.id.toString(),
                            orderDate: new Date(orderData.created_at),
                            items: orderItems,
                            subtotal: orderData.total_amount || 0,
                            total: orderData.total_amount || 0,
                            currency: paymentIntentSucceeded.currency.toUpperCase(),
                            shippingAddress: shippingAddress,
                            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
                        });

                        await sendMail({
                            to: userEmail,
                            subject: orderTemplate.subject,
                            html: orderTemplate.html,
                            text: orderTemplate.text
                        });

                        console.log(`Payment success and order confirmation emails sent to ${userEmail}`);
                    }
                } catch (emailError) {
                    console.error("Failed to send payment/order emails:", emailError);
                    // Don't fail the webhook if email fails
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
