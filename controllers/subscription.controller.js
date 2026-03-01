import Company from "../models/company.model.js";

// Set or update subscription plan
export const setSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { subscription, durationDays } = req.body; // durationDays for pro/premium
    const company = await Company.findById(id);
    if (!company) return res.status(404).json({ message: "Company not found" });

    company.subscription = subscription;
    company.isTrialActive = subscription === "trial";
    company.subscriptionStart = new Date();
    if (subscription === "trial") {
      company.subscriptionEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
    } else if (durationDays) {
      company.subscriptionEnd = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
    } else {
      company.subscriptionEnd = null;
    }
    company.isActive = true;
    await company.save();
    res.json({ message: "Subscription updated", company });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Extend trial
export const extendTrial = async (req, res) => {
  try {
    const { id } = req.params;
    const { extraDays } = req.body;
    const company = await Company.findById(id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    if (company.subscription !== "trial") return res.status(400).json({ message: "Not in trial" });
    if (!company.subscriptionEnd) company.subscriptionEnd = new Date();
    company.subscriptionEnd = new Date(company.subscriptionEnd.getTime() + (extraDays * 24 * 60 * 60 * 1000));
    await company.save();
    res.json({ message: "Trial extended", company });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Stop trial
export const stopTrial = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    if (company.subscription !== "trial") return res.status(400).json({ message: "Not in trial" });
    company.isTrialActive = false;
    company.subscriptionEnd = new Date();
    company.isActive = false;
    await company.save();
    res.json({ message: "Trial stopped", company });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove company (delete all data)
export const removeCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findByIdAndDelete(id);
    if (!company) return res.status(404).json({ message: "Company not found" });
    // TODO: Optionally trigger deletion in main backend
    res.json({ message: "Company removed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};