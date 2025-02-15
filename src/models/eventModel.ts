import mongoose, { Document } from "mongoose";

export interface IEvent extends Document {
  name: string;
  location: string;
  date: Date;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

eventSchema.virtual("totalTicketsPurchased", {
  ref: "Ticket",
  localField: "_id",
  foreignField: "eventId",
  count: true,
});

eventSchema.virtual("totalTicketsEntered", {
  ref: "Ticket",
  localField: "_id",
  foreignField: "eventId",
  match: { entered: true },
  count: true,
});

eventSchema.index({ name: 1 }, { unique: true });

const Events = mongoose.model("Event", eventSchema);

export default Events;
