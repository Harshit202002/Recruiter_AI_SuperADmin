import express from "express";
import { protect, superAdminOnly } from "../middleware/auth.middleware.js";
import { setSubscription, extendTrial, stopTrial, removeCompany } from "../controllers/subscription.controller.js";

const router = express.Router();

// All routes are super admin only
router.use(protect, superAdminOnly);

router.put("/:id/set", setSubscription); // set or update subscription
router.put("/:id/extend-trial", extendTrial); // extend trial
router.put("/:id/stop-trial", stopTrial); // stop trial
router.delete("/:id", removeCompany); // remove company

export default router;