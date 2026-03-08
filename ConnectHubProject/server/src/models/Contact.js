import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please add a contact name'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    phone: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    is_favorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
contactSchema.index({ userId: 1 });
contactSchema.index({ name: 1 });
contactSchema.index({ tags: 1 });

// Avoid recompiling model during hot reloads or multiple imports
export default mongoose.models.Contact || mongoose.model('Contact', contactSchema);