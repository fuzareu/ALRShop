import connectDB from "@/config/db";
import Address from "@/models/address";
import Order from "@/models/order";
import Product from "@/models/product";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const {userId} = getAuth(request)

        await connectDB()

        Address.length
        Product.length

        const orders = await Order.find({ userId, $or : [{ paymentType: 'COD'}, { paymentType: 'Stripe', isPaid: true}] })
            .populate('address')
            .populate('items.product'); // Ensure both 'address' and 'items.product' are populated correctly

        return NextResponse.json({success: true, orders})

    } catch (error) {
        return NextResponse.json({success: false, message: error.message})
    }
}