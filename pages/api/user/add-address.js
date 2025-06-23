
import { getAuth } from "@clerk/nextjs/server";
import Address from "@/models/Address";
import connectDB from "@/config/db";


export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    await connectDB;

    const { address } = req.body;

    const newAddress = await Address.create({
      userId,
      ...address
    });

    await newAddress.save();

    return res.status(200).json({ success: true, message: "Address added successfully" });
  } catch (error) {
    console.error("Error adding address:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}