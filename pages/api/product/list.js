import connectDB from "@/config/db";
import Product from "@/models/Product";



export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
   
    await connectDB();

    const products = await Product.find({});

    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching seller data:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}