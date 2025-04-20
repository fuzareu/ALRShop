import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Product from "@/models/product";
import order from "@/models/order";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
    try {

        const { userId } = getAuth(request);
        const { address, items } = await request.json();
        const origin = request.headers.get('origin')

        if (!address || items.length === 0) {
            return NextResponse.json({ success: false, message: 'Invalid Data' })
        }

        let productData = []

        // calculate amount using items
        let amount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity
            })
            if (!product) throw new Error(`Product not found: ${item.product}`);
            amount += product.offerPrice * item.quantity;
        }

        // Create order in the database
        const Order = await order.create({
            userId,
            address,
            items,
            total: amount + amount * 0.02, // Apply any discount logic
            status: 'Order Placed',
            date: Date.now(),
            paymentType: 'Stripe'
        });

        // create line items for stripe
        const line_items = productData.map(item => {
            return {
                price_data: {
                    currency: 'php',
                    product_data: {
                        name: item.name
                    },
                    unit_amount: item.price * 100
                },
                quantity: item.quantity

            }

        })

        // create session
        const session = await stripe.checkout.sessions.create({
            line_items,
            mode:'payment',
            success_url: `${origin}/order-placed`,
            cancel_url: `${origin}/cart`,
            metadata:{
                orderId:Order._id.toString(),
                userId
            }
        })

        const url = session.url

        return NextResponse.json({ success:true, url })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ success:false, message:'error.message' })
    }

}