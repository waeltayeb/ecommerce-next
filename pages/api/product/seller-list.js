import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Product from "@/models/Product";
import { getAuth} from "@clerk/nextjs/server";


export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const seller = await authSeller(userId);

    if (!seller) {
      return res.status(404).json({ success: false, message: "Seller not found" });
    }

    await connectDB();

    const products = await Product.find({ userId: userId });

    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching seller data:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}