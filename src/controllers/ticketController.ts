import QRCode from "qrcode";
import Ticket from "../models/ticketModel";
import sendMail from "../services/emailService";
import { createMomoPayment } from "../services/momoService";

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

  buyTicket: async (req, res) => {
    try {
      const { email, event } = req.body;
      const userId = req.user?.id;
      const payment = await createMomoPayment(userId, event);

      sendMail(email, payment.shortLink, "THANH TOÁN").catch((err) =>
        console.error("Lỗi gửi email:", err),
      );
      return res.status(200).json({
        status: "success",
        msg: "Thông tin thanh toán đã gửi đến email. Vui lòng kiểm tra email",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: err.message });
    }
  },
  ipn: async (req, res) => {
    try {
      const { extraData, resultCode, orderId, amount } = req.body;
      if (resultCode !== 0) {
        console.log(`Giao dịch thất bại: ${orderId}, Mã lỗi: ${resultCode}`);
        return res.status(400).json({ msg: "Giao dịch thất bại!" });
      }

      const params = new URLSearchParams(extraData);
      const eventId = params.get("eventId");
      const userId = params.get("userId");

      if (!eventId || !userId) {
        return res.status(400).json({ msg: "Thiếu eventId hoặc userId" });
      }

      const existingTicket = await Ticket.findOne({ eventId, userId });

      if (existingTicket) {
        return res.status(409).json({ msg: "Vé đã được đặt trước đó!" });
      }

      const ticket = new Ticket({
        eventId,
        userId,
        amount,
        orderId,
        status: "PAID",
      });

      await ticket.save();

      console.log(`Thanh toán thành công, tạo vé: ${ticket._id}`);

      return res.status(200).json({ msg: "Thanh toán thành công!", ticket });
    } catch (err: any) {
      console.error("Lỗi xử lý IPN:", err);
      return res.status(500).json({ msg: "Lỗi hệ thống!", error: err.message });
    }
  },
};

export default ticketController;
