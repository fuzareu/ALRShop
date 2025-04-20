import connectDB from "@/config/db";
import { inngest } from "@/config/inngest";
import Product from "@/models/product";
import User from "@/models/user";
import Order from "@/models/order";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        await connectDB()

        const {userId} = getAuth(request);

        const { address, items } = await request.json();

        if (!address || items.length === 0) {
            return NextResponse.json({success: false, message: 'Invalid Data'})
        }

        // calculate amount using items
        let amount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) throw new Error(`Product not found: ${item.product}`);
            amount += product.offerPrice * item.quantity;
        }

        // Create order in the database
        const newOrder = await Order.create({
            userId,
            address,
            items,
            total: amount + amount * 0.02, // Apply any discount logic
            status: 'Order Placed',
            date: Date.now()
        });

        await inngest.send({
            name: 'order/created',
            data: {
                userId,
                address,
                items,
                total: newOrder.total,
                date: newOrder.date, 
            }
        })

        //clear user cart
        const user = await User.findById(userId);
        user.cartItems = {}
        await user.save()

        return NextResponse.json({success: true, message: 'Order Placed'})

    } catch (error) {
        console.log(error)
        return NextResponse.json({ success: false, message: error.message})
    }
}

// TEST