import { InferSchemaType, Schema, model } from "mongoose";

const MessageSchema = new Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: String,
    replyTo: Schema.Types.ObjectId,
    filesId: {
      type: [Schema.Types.ObjectId],
      ref: "File",
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default model("Message", MessageSchema);

export type MessageType = InferSchemaType<typeof MessageSchema>;
