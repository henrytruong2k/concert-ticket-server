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
      const { name, location, date, amount } = req.body;
      const eventId = req.params.id;

      const event = await Event.findById(eventId);
      if (!event)
        return res.status(404).json({ message: "Sự kiện không tồn tại" });
      let newImageUrl = event.image;
      let newPublicId = event.publicId;

      console.log("Danh sách file nhận được:", req.files);

      if (req.files.length === 0) {
        console.log("Không có ảnh mới, giữ nguyên ảnh cũ.");
      } else {
        console.log("Đang xử lý ảnh mới...");

        newImageUrl = req.files[0].path;
        newPublicId = req.files[0].filename;

        if (event.publicId) {
          console.log("Xóa ảnh cũ:", event.publicId);
          cloudinary.uploader
            .destroy(event.publicId)
            .catch((error) => console.log(error));
        }

        console.log("Ảnh mới đã upload:", newImageUrl);
      }

      await Event.findByIdAndUpdate(
        eventId,
        {
          name,
          location,
          date,
          amount,
          image: newImageUrl,
          publicId: newPublicId,
        },
        { new: true },
      );

      return res.status(200).json();
    } catch (err) {
      console.log("Lỗi cập nhật sự kiện:", err);
      return res.status(500).json({ message: err });
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
