import mongoose from "mongoose";
import AddressModel from "../model/address";
import PostModel from "../model/post";

export const postGenerator = async () => {
  try {
    await addressGenerator();
    await PostModel.insertMany(randomPostGenerator());
  } catch (err) {
    console.log(err);
  }
};

export const randomPostGenerator = async () => {
  const addresses = await AddressModel.find();
  const addressesCount = await AddressModel.countDocuments();
  const array = [];
  for (let i = 0; i < 5; i++) {
    array.push({
      address: addresses[Math.floor(Math.random() * (addressesCount - 1))],
      title: generateRandomText(130),
      description: generateRandomText(300),
      medias: [],
      created_by: "67e430a1c045a6234d771331",
    });
  }
  return array;
};

export const addressGenerator = async () => {
  await AddressModel.insertMany(randomLocationGenerator());
};

const randomLocationGenerator = () => {
  const array = [];
  for (let i = 0; i < 100; i++) {
    array.push({
      address: "asdf asdf asdf sd",
      location: {
        type: "Point",
        coordinates: [Math.random() * 360 - 180, Math.random() * 180 - 90],
      },
      is_main_address: false,
      created_by: "67e430a1c045a6234d771331",
    });
  }
  return array;
};

function generateRandomText(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789                                 ";
  const charactersLength = characters.length;
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function getRandomDate() {
  const start = new Date(1970, 0, 1); // January 1, 1970 (month is 0-indexed)
  const end = new Date(); // Current date and time
  const randomTime =
    start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime);
}
