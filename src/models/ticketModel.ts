import mongoose, { Schema } from "mongoose";

export interface ITicket extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  orderId: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED";
  entered: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema: Schema = new Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    userId: { type: String, required: true },
    orderId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
    entered: { type: Boolean, default: false }, // Thêm field entered
  },
  { timestamps: true },
);

ticketSchema.post("save", async function (doc, next) {
  await mongoose.model("Event").findByIdAndUpdate(doc.eventId, {
    $inc: { totalTicketsPurchased: 1 },
  });
  next();
});

ticketSchema.post("findOneAndUpdate", async function (doc) {
  if (!doc) return;

  if (doc.entered) {
    await mongoose.model("Event").findByIdAndUpdate(doc.eventId, {
      $inc: { totalTicketsEntered: 1 },
    });
  }
});

const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);

export default Ticket;
