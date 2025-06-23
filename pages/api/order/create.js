import { inngest } from "@/config/inngest";
import Product from "@/models/Product";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";



export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { userId } = getAuth();
    const {address, items } = req.body;
    if (!address || items.length === 0){
              return res.status(400).json({ success: false, message: "invalide data" });
    }

    const amount = await items.reduce(async(acc, item) => {
        const product = await Product.findById(item.product);
        return acc + product.offerPrice * item.quantity;
    },0)

    await inngest.send({
        name: 'order/created',
        data:{
            userId,
            address,
            items,
            amount: amount + Math.floor(amount*0.02),
            date: Date.now()
        }
    })

    // clrea user cart 
    const user = await User.findById(userId);
    user.cartItems = {}
    await user.save();

    return res.status(200).json({success: true, message:'Order Placed'})

     } catch (error) {
    console.error("Error adding address:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}