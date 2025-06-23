import connectDB from "@/config/db";
import Address from "@/models/Address";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    try {
        const { userId } = await getAuth(req);

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        await connectDB();

        const orders = await Order.find({ userId })
            .populate("address")
            .populate("items.product")
            .sort({ date: -1 }); // optionnel : les plus récents en premier

        return res.status(200).json({ success: true, orders });

    } catch (error) {
        console.error("❌ Error fetching orders:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
