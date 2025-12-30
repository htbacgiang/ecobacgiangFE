import { mongooseConnect } from "../../../lib/mongoose";
import PromoBannerConfig from "../../../models/PromoBannerConfig";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      await mongooseConnect();
      const config = await PromoBannerConfig.getConfig();
      return res.status(200).json(config);
    } catch (error) {
      console.error("Error fetching promo banner config:", error);
      return res.status(500).json({ error: "Failed to fetch config" });
    }
  }

  if (req.method === "PUT") {
    try {
      await mongooseConnect();
      
      const {
        countdownDate,
        subtitle,
        title,
        description,
        countdownLabel,
        buttonText,
        buttonLink,
        backgroundImage,
        isActive,
      } = req.body;

      // Lấy config hiện tại hoặc tạo mới
      let config = await PromoBannerConfig.findOne();
      if (!config) {
        config = new PromoBannerConfig();
      }

      // Cập nhật các trường
      if (countdownDate !== undefined) {
        config.countdownDate = new Date(countdownDate);
      }
      if (subtitle !== undefined) config.subtitle = subtitle;
      if (title !== undefined) config.title = title;
      if (description !== undefined) config.description = description;
      if (countdownLabel !== undefined) config.countdownLabel = countdownLabel;
      if (buttonText !== undefined) config.buttonText = buttonText;
      if (buttonLink !== undefined) config.buttonLink = buttonLink;
      if (backgroundImage !== undefined) config.backgroundImage = backgroundImage;
      if (isActive !== undefined) config.isActive = isActive;

      await config.save();

      return res.status(200).json(config);
    } catch (error) {
      console.error("Error updating promo banner config:", error);
      return res.status(500).json({ error: "Failed to update config" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

