import mongoose from "mongoose";
const FileSchema = new mongoose.Schema({
  filePath: String,
  originalName: String,
  mimeType: String,
});
export default FileSchema;
