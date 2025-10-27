import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = req.auth(); // ✅ correct modern usage

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not Logged In" });
    }

    const user = await clerkClient.users.getUser(userId);

    if (user.privateMetadata.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not Authorized" });
    }

    next(); // ✅ Only continues if admin
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Authorization Error" });
  }
};
