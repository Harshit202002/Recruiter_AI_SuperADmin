import express from "express";
import CompanyController from "../controllers/company.controller.js";
import { protect, superAdminOnly } from "../middleware/auth.middleware.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.post("/register",  upload.single("logo"), CompanyController.register);

// Get all companies
router.get("/", protect, superAdminOnly, CompanyController.getAll);

// Update a company
router.put("/:id", protect, superAdminOnly, upload.single("logo"), CompanyController.update);

// Delete a company
router.delete("/:id", protect, superAdminOnly, CompanyController.delete);

export default router;
