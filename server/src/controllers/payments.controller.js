import { recordPaymentService } from "../services/payments.service.js";

export const recordPayment = async (req, res) => {
  try {
    const payment = await recordPaymentService(req.body, req.user?.id);
    res.status(201).json(payment);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};
