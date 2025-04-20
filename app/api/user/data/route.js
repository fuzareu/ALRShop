import connectDB from "@/config/db";
import User from "@/models/user";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request){

    try {
        
        const { userId } = getAuth(request)
        console.log("UserId:", userId); 

        await connectDB()
        console.log("Connected to DB");

        const user = await User.findById(userId)
        

        if (!user) {
            return NextResponse.json({ success: false, message: "User Not Found" })
        }

        return NextResponse.json({success:true, user})

    } catch (error) {
        console.log("Fetching user with ID:", userId);
        return NextResponse.json({ success: false, message: error.message })

    }
}