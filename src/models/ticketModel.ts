import mongoose, { Schema } from "mongoose";

export interface ITicket extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  entered: boolean;
}

const ticketSchema = new Schema<ITicket>({
  eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  entered: { type: Boolean, default: false },
});

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
