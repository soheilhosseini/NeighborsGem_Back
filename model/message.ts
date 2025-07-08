import { InferSchemaType, Schema, model } from "mongoose";

const MessageSchema = new Schema(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: String,
    replyTo: { type: Schema.Types.ObjectId, ref: "Message" },
    filesId: {
      type: [Schema.Types.ObjectId],
      ref: "File",
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  },
  { timestamps: true }
);

export default model("Message", MessageSchema);

export type MessageType = InferSchemaType<typeof MessageSchema>;
