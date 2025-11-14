import { Schema, model, models, Document, Model } from 'mongoose';

// Event document shape stored in MongoDB
export interface EventDocument extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // Normalized ISO date string (YYYY-MM-DD)
  time: string; // Normalized time string in HH:MM (24h)
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EventModel extends Model<EventDocument> {}

// Helper to generate a URL-friendly slug from the title
const generateSlug = (title: string): string => {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric characters
    .replace(/\s+/g, '-') // replace whitespace with hyphens
    .replace(/-+/g, '-'); // collapse multiple hyphens
};

// Event schema definition
const eventSchema = new Schema<EventDocument, EventModel>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (value: unknown): boolean => {
          if (!Array.isArray(value) || value.length === 0) return false;
          return value.every(
            (item) => typeof item === 'string' && item.trim().length > 0,
          );
        },
        message: 'Agenda must contain at least one non-empty item.',
      },
    },
    organizer: { type: String, required: true, trim: true },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (value: unknown): boolean => {
          if (!Array.isArray(value) || value.length === 0) return false;
          return value.every(
            (item) => typeof item === 'string' && item.trim().length > 0,
          );
        },
        message: 'Tags must contain at least one non-empty item.',
      },
    },
  },
  {
    timestamps: true, // createdAt and updatedAt managed by Mongoose
    strict: true,
  },
);

// Pre-save hook: validate required fields, normalize date/time, and generate slug
eventSchema.pre<EventDocument>('save', function preSave(next) {
  try {
    // Ensure required string fields are present and non-empty
    const requiredStringFields: Array<keyof EventDocument> = [
      'title',
      'description',
      'overview',
      'image',
      'venue',
      'location',
      'date',
      'time',
      'mode',
      'audience',
      'organizer',
    ];

    for (const field of requiredStringFields) {
      const value = this[field];
      if (typeof value !== 'string' || value.trim().length === 0) {
        return next(
          new Error(`Field "${String(field)}" is required and must be a non-empty string.`),
        );
      }

      // Normalize string fields by trimming whitespace
      (this as unknown as Record<string, string>)[field as string] = value.trim();
    }

    // Normalize agenda and tags items by trimming whitespace
    this.agenda = this.agenda.map((item) => item.trim());
    this.tags = this.tags.map((item) => item.trim());

    // Normalize and validate date to ISO format (YYYY-MM-DD)
    const parsedDate = new Date(this.date);
    if (Number.isNaN(parsedDate.getTime())) {
      return next(new Error('Invalid date format. Expected a parsable date string.'));
    }
    // Store only the date portion in ISO format for consistency
    this.date = parsedDate.toISOString().split('T')[0];

    // Normalize and validate time to HH:MM (24-hour)
    const timeValue = this.time.trim();
    const timeMatch = timeValue.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    if (!timeMatch) {
      return next(
        new Error('Invalid time format. Expected HH:MM in 24-hour format.'),
      );
    }
    const [, hours, minutes] = timeMatch;
    this.time = `${hours}:${minutes}`;

    // Generate slug from title only if title changed or slug is missing
    if (this.isModified('title') || !this.slug) {
      this.slug = generateSlug(this.title);
    }

    return next();
  } catch (error) {
    return next(error as Error);
  }
});

export const Event: EventModel =
  (models.Event as EventModel | undefined) ||
  model<EventDocument, EventModel>('Event', eventSchema);
