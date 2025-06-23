import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { IncomingForm } from "formidable";
import fs from "fs";

// Désactiver le bodyParser intégré de Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

// Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const { userId } = getAuth(req);
    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const form = new IncomingForm({ multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Form parsing error:", err);
        return res.status(500).json({ success: false, message: "Form parsing failed" });
      }

      // Extraire les champs et forcer string (le cas échéant)
      const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
      const description = Array.isArray(fields.description) ? fields.description[0] : fields.description;
      const category = Array.isArray(fields.category) ? fields.category[0] : fields.category;
      const price = Array.isArray(fields.price) ? fields.price[0] : fields.price;
      const offerPrice = Array.isArray(fields.offerPrice) ? fields.offerPrice[0] : fields.offerPrice;

      // Récupérer les fichiers images, forcer en tableau même si 1 seul
      const fileArray = Array.isArray(files.images) ? files.images : [files.images];

      if (!fileArray || fileArray.length === 0 || !fileArray[0]) {
        return res.status(400).json({ success: false, message: "No images provided" });
      }

      // Upload des images vers Cloudinary
      const imageUrls = await Promise.all(
        fileArray.map(file => {
          const data = fs.readFileSync(file.filepath);
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { resource_type: "auto" },
              (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
              }
            );
            uploadStream.end(data);
          });
        })
      );

      // Connexion à la base
      await connectDB();

      // Création du produit
      const newProduct = await Product.create({
        userId,
        name,
        description,
        category,
        price: Number(price),
        offerPrice: offerPrice ? Number(offerPrice) : null,
        image: imageUrls,
        date: Date.now(),
      });

      return res.status(201).json({ success: true, product: newProduct });
    });
  } catch (error) {
    console.error("❌ Error in /api/product/add:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
