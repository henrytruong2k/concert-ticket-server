import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: {
        unique: true,
      },
    },
    location: {
      type: String,
      required: true,
      index: true,
    },
    date: { type: Date, required: true },
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

const Events = mongoose.model("Event", eventSchema);

export default Events;
