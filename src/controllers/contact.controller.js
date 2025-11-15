import { Contact } from "../models/contact.model.js";

// [POST] Save contact message
export const saveMessage = async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newMessage = await Contact.create({ name, email, message });
    res.status(201).json({ message: "Message received successfully", data: newMessage });
  } catch (err) {
    next(err);
  }
};

// [GET] (Optional) Fetch all messages (admin)
export const getMessages = async (req, res, next) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    next(err);
  }
};
