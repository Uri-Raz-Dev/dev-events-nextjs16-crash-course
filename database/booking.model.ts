import { Schema, model, models, Document, Model, Types } from 'mongoose';
import { Event, EventDocument } from './event.model';

// Booking document shape stored in MongoDB
export interface BookingDocument extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingModel extends Model<BookingDocument> {}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Booking schema definition
const bookingSchema = new Schema<BookingDocument, BookingModel>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true, // index on eventId for faster lookups by event
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string): boolean => EMAIL_REGEX.test(value),
        message: 'Email must be a valid email address.',
      },
    },
  },
  {
    timestamps: true, // createdAt and updatedAt managed by Mongoose
    strict: true,
  },
);

// Pre-save hook: validate email and ensure referenced event exists
bookingSchema.pre<BookingDocument>('save', async function preSave(next) {
  try {
    // Validate email format again at save-time for safety
    if (!this.email || !EMAIL_REGEX.test(this.email)) {
      return next(new Error('Email must be a valid, non-empty email address.'));
    }

    // Ensure the referenced event exists before saving the booking
    if (!this.eventId) {
      return next(new Error('eventId is required.'));
    }

    const existingEvent = await Event.exists({ _id: this.eventId });
    if (!existingEvent) {
      return next(new Error('Referenced event does not exist.'));
    }

    return next();
  } catch (error) {
    return next(error as Error);
  }
});

export const Booking: BookingModel =
  (models.Booking as BookingModel | undefined) ||
  model<BookingDocument, BookingModel>('Booking', bookingSchema);
