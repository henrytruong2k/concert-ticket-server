import QRCode from "qrcode";
import Ticket from "../models/ticketModel";
import sendMail from "../services/emailService";
import { createMomoPayment } from "../services/momoService";

const ticketController = {
  getMany: async (req, res) => {
    try {
      const tickets = await Ticket.find({ userId: req.user.id })
        .populate({
          path: "eventId",
          select: "name location date",
        })
        .lean();

      const ticketsWithEvent = tickets.map(({ eventId, ...ticket }) => ({
        ...ticket,
        event: eventId, // Đổi eventId thành event
      }));

      return res.status(200).json({
        status: "success",
        message: "Lấy danh sách vé thành công",
        data: ticketsWithEvent,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Lỗi hệ thống" });
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
          .json({ status: "fail", message: "Vé không tồn tại" });
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
        message: "Lấy vé thành công!",
        data: {
          ticket: ticketWithEvent,
          qrCode,
        },
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  scanTicket: async (req, res) => {
    try {
      const { ticketId, ownerId } = req.body;
      console.log(req.body);

      // Kiểm tra xem vé có tồn tại và thuộc về ownerId hay không
      const ticket = await Ticket.findOne({ _id: ticketId, userId: ownerId });

      if (!ticket) {
        return res.status(400).json({
          status: "fail",
          message: "Vé không hợp lệ hoặc không thuộc về bạn!",
        });
      }

      // Kiểm tra xem vé đã được sử dụng chưa
      if (ticket.entered) {
        return res.status(400).json({
          status: "fail",
          message: "Vé đã được quẹt trước đó!",
        });
      }

      // Cập nhật trạng thái vé
      ticket.entered = true;
      await ticket.save();

      return res.status(200).json({
        status: "success",
        message: "Vé hợp lệ! Quẹt thành công.",
        data: ticket,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Lỗi hệ thống" });
    }
  },

  buyTicket: async (req, res) => {
    try {
      const { email, event } = req.body;
      console.log(req.body);
      const userId = req.user?.id;
      // const event = await Events.findById(eventId);
      const payment = await createMomoPayment(userId, event);
      console.log(payment);

      sendMail(email, payment.payUrl, payment.shortLink, "THANH TOÁN").catch(
        (err) => console.error("Lỗi gửi email:", err),
      );
      return res.status(200).json({
        status: "success",
        message:
          "Thông tin thanh toán đã gửi đến email. Vui lòng kiểm tra email",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: err.message });
    }
  },
  ipn: async (req, res) => {
    try {
      const { extraData, resultCode, orderId, amount } = req.body;
      if (resultCode !== 0) {
        console.log(`Giao dịch thất bại: ${orderId}, Mã lỗi: ${resultCode}`);
        return res.status(400).json({ message: "Giao dịch thất bại!" });
      }

      const params = new URLSearchParams(extraData);
      const eventId = params.get("eventId");
      const userId = params.get("userId");

      if (!eventId || !userId) {
        return res.status(400).json({ message: "Thiếu eventId hoặc userId" });
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

      return res
        .status(200)
        .json({ message: "Thanh toán thành công!", ticket });
    } catch (err: any) {
      console.error("Lỗi xử lý IPN:", err);
      return res
        .status(500)
        .json({ message: "Lỗi hệ thống!", error: err.message });
    }
  },
};

export default ticketController;
