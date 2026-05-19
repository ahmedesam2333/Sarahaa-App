import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      minLength: 2,
      maxLength: 20000,
      required: function () {
        return this.attachments.length ? false : true;
      },
    },
    attachments: [{ secure_url: String, public_id: String }],
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deletedAt: Date,
    deletedBy: mongoose.Schema.Types.ObjectId,
    restoredAt: Date,
    restoredBy: mongoose.Schema.Types.ObjectId,
  },
  {
    timestamps: true,
  }
);

const MessageModel =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
export default MessageModel;
