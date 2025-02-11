import QRCode from "qrcode";
import Ticket from "../models/ticketModel";

const ticketController = {
  getMany: async (req, res) => {
    try {
      const tickets = await Ticket.find({ userId: req.user.id })
        .populate("eventId", "name location date") // Lấy thông tin event
        .lean();

      const ticketsWithEvent = tickets.map((ticket) => ({
        ...ticket,
        event: ticket.eventId,
        eventId: ticket.eventId._id,
      }));
      return res.status(200).json({
        status: "success",
        msg: "Lấy danh sách vé thành công",
        data: ticketsWithEvent,
      });
    } catch (err) {
      return res.status(500).json({ msg: "Lỗi hệ thống" });
    }
  },

  createOne: async (req, res) => {
    try {
      const userId = req.user?.id;
      const { eventId } = req.body;
      const event = new Ticket({
        eventId,
        userId,
      });
      await event.save();
      return res.status(200).json(event);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  getOne: async (req, res) => {
    try {
      const ticketId = req.params.id;
      const userId = req.user?.id;

      const ticket = await Ticket.findOne({ _id: ticketId, userId })
        .populate("eventId", "name location date") // Lấy thông tin event
        .lean();
      if (!ticket) {
        return res
          .status(404)
          .json({ status: "fail", msg: "Vé không tồn tại" });
      }

      const ticketWithEvent = {
        ...ticket,
        event: ticket.eventId,
        eventId: ticket.eventId._id,
      };

      const qrData = JSON.stringify({
        ticketId,
        ownerId: ticket.userId,
      });

      const qrCode = await QRCode.toDataURL(qrData);
      return res.status(200).json({
        status: "success",
        msg: "Lấy vé thành công!",
        data: {
          ticket: ticketWithEvent,
          qrCode,
        },
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  scanTicket: async (req, res) => {
    try {
      const { ticketId } = req.body;
      const ticket = await Ticket.findOneAndUpdate(
        { _id: ticketId, entered: false }, // Điều kiện: Vé tồn tại và chưa được sử dụng
        { entered: true },
        { new: true }, // Lấy bản ghi sau khi update
      );
      if (!ticket) {
        return res.status(400).json({
          status: "fail",
          msg: "Vé không hợp lệ",
        });
      }

      return res.status(200).json({
        status: "success",
        msg: "Vé hợp lệ! Quẹt thành công.",
        data: ticket,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: "Lỗi hệ thống" });
    }
  },
};

export default ticketController;
