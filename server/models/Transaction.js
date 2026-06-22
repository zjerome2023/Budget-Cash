import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    date: {
      type: Date,
      required: true,
      default: () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
      },
    },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, categoryId: 1 });

export default mongoose.model('Transaction', transactionSchema);
