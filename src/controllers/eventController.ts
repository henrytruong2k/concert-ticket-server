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
      return res.status(500).json({ msg: err.message });
    }
  },
  getOne: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event)
        return res.status(404).json({
          msg: "This ticket does not exist",
        });

      return res.status(200).json({
        data: event,
      });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
  createOne: async (req, res) => {
    try {
      const { name, location, date, amount } = req.body;
      const event = new Event({
        name,
        location,
        date,
        amount,
      });
      await event.save();
      return res.status(201).json(event);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: err.message });
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
        return res.status(404).json({ msg: "This ticket does not exist" });

      return res.status(200).json(event);
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },

  deleteOne: async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id);
      const deletedEvent = await Event.findByIdAndDelete(id);

      if (!deletedEvent) {
        return res.status(404).json({ msg: "Event not found" });
      }

      return res.status(200).json({ msg: "Event deleted successfully" });
    } catch (err) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

export default eventController;
