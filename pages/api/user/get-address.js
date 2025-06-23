import connectDB from "@/config/db";
import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        await connectDB();

        const addresses = await Address.find({ userId });

        return res.status(200).json({ success: true, addresses });
    } catch (error) {
        console.error("Error fetching addresses:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}