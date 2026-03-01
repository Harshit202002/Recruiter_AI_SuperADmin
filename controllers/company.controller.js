import Company from "../models/company.model.js";
import cloudinary from "../utils/cloudinary.js"; 


const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

class CompanyController {

  // Register a new company
  static async register(req, res) {
    try {
      const {
        companyName,
        email,
        companyType,
        gstNumber,
        typeOfStaffing,
        panNumber,
        phoneNo,
        numberOfEmployees,
        address1,
        address2,
        city,
        state
      } = req.body;

      let logoUrl = "";
      if (req.file) {
        logoUrl = await uploadToCloudinary(req.file.buffer, "company_logos");
      }

      // 1. Save company in SuperAdmin DB
      const company = new Company({
        companyName,
        email,
        companyType,
        gstNumber,
        typeOfStaffing,
        panNumber,
        phoneNo,
        numberOfEmployees,
        address1,
        address2,
        city,
        state,
        logo: logoUrl
      });
      await company.save();

      // 2. Call main backend API to create company DB, company, and admin user
      const axios = (await import('axios')).default;
      const mainBackendUrl = process.env.MAIN_BACKEND_URL || 'http://localhost:4000';
      // Generate a random password for admin
      const adminPassword = Math.random().toString(36).slice(-8) + '@A1';
      // Save company in main backend
      const mainCompanyPayload = {
        externalCompanyId: company._id,
        companyName,
        email,
        companyType,
        gstNumber,
        typeOfStaffing,
        panNumber,
        phoneNo,
        numberOfEmployees,
        address1,
        address2,
        city,
        state,
        logo: logoUrl,
        admin: {
          name: 'Admin',
          email,
          password: adminPassword
        }
      };
      let mainCompanyRes;
      try {
        mainCompanyRes = await axios.post(`${mainBackendUrl}/api/company/register`, mainCompanyPayload);
      } catch (err) {
        // Rollback superadmin DB if needed
        await Company.findByIdAndDelete(company._id);
        return res.status(500).json({ error: 'Failed to create company in main backend', details: err?.response?.data || err.message });
      }

      // 3. Send admin credentials email
      const sendEmail = (await import('../utils/sendEmail.js')).default;
      await sendEmail({
        to: email,
        subject: 'Your Company Admin Account',
        html: `<p>Your company has been registered.<br>Admin Email: <b>${email}</b><br>Password: <b>${adminPassword}</b><br>Please login and change your password.</p>`
      });

      res.status(201).json({
        message: "Company registered successfully",
        company,
        mainCompany: mainCompanyRes.data
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

   // Get all companies
  static async getAll(req, res) {
    try {
      const companies = await Company.find();
      res.status(200).json({ companies });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  // Update a company
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // If a new logo is uploaded
      if (req.file) {
        const logoUrl = await uploadToCloudinary(req.file.buffer, "company_logos");
        updateData.logo = logoUrl;
      }

      const updatedCompany = await Company.findByIdAndUpdate(id, updateData, { new: true });

      if (!updatedCompany) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.status(200).json({ message: "Company updated successfully", company: updatedCompany });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }

  // Delete a company
  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deletedCompany = await Company.findByIdAndDelete(id);

      if (!deletedCompany) {
        return res.status(404).json({ message: "Company not found" });
      }

      res.status(200).json({ message: "Company deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    }
  }
}




export default CompanyController ;