import { error } from "console";
import { cloudinary } from "../configs/cloudinary";
import Event from "../models/eventModel";

const eventController = {
  getMany: async (req, res) => {
    try {
      const events = await Event.find().populate([
        "totalTicketsPurchased",
        "totalTicketsEntered",
      ]);
      return res.status(200).json({
        data: events,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  getOne: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event)
        return res.status(404).json({
          message: "This ticket does not exist",
        });

      return res.status(200).json({
        data: event,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  createOne: async (req, res) => {
    const file = req.file;
    const image = file.path;
    const publicId = file.filename;
    try {
      const { name, location, date, amount } = req.body;
      const event = new Event({
        name,
        location,
        date,
        amount,
        image,
        publicId,
      });
      await event.save();
      return res.status(201).json();
    } catch (err) {
      console.log(err);
      cloudinary.uploader.destroy(file.filename).catch((err) => {
        console.error("Failed to delete image:", err);
      });
      return res.status(500).json({ message: err.message });
    }
  },

  updateOne: async (req, res) => {
    try {
      const { name, location, date } = req.body;

      const event = await Event.findByIdAndUpdate(
        req.params.id,
        { name, location, date },
        { new: true },
      );

      if (!event)
        return res.status(404).json({ message: "This ticket does not exist" });

      return res.status(200).json(event);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  deleteOne: async (req, res) => {
    try {
      const { id } = req.params;
      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.publicId) {
        cloudinary.uploader.destroy(event.publicId).catch((err) => {
          console.error("Failed to delete image:", err);
        });
      }

      await Event.deleteOne({ _id: id });
      return res.status(200).json({ message: "Event deleted successfully" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
};

export default eventController;
