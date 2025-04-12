import fs from "fs/promises";
const createEssentialDirectories = async () => {
  await fs.mkdir("uploads/avatars", { recursive: true });
  await fs.mkdir("uploads/avatars/thumbnails", { recursive: true });
  // await fs.mkdir("uploads/posts", { recursive: true });
  await fs.mkdir("uploads/files", { recursive: true });
  await fs.mkdir("uploads/posts", { recursive: true });
};
export default createEssentialDirectories;
