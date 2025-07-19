import dotenv from "dotenv";
dotenv.config();

const mainCategories = [
  "Home Maintenance",
  "Technical Support",
  "Vehicle Services",
  "Childcare",
  "Pet Care",
  "Cleaning Services",
  "Gardening",
  "Food Sharing",
  "Cooking Exchange",
  "Language Exchange",
  "Tutoring",
  "Crafting",
  "Barter",
  "Donations",
  "Lending",
  "Borrowing",
  "Used Goods Sales",
  "Job Offers",
  "Job Requests",
  "Event Hosting",
  "Game Organizing",
  "Fitness Activities",
  "Discussion Threads",
  "Emotional Support",
  "Elderly Assistance",
  "Lost Items",
  "Crime Reports",
  "Road Hazards",
  "Weather Alerts",
  "Babysitting",
  "Group Meetups",
  "Hobby Clubs",
  "Skill Swapping",
  "Marketplace Requests",
  "News",
  "Religious Gatherings",
  "Charity Fundraisers",
  "Book Sharing",
  "Furniture Exchange",
  "Room Rentals",
  "Tool Repair",
  "Community Polls",
  "Cultural Events",
  "Online Games",
  "Board Games",
  "Public Announcements",
  "Ride Sharing",
  "Group Purchases",
  "Recommendations",
  "Warning Notices",
  "Health",
  "Travel",
  "Tech",
];

export async function getCategoriesFromHuggingFace(content: string) {
  const HF_API_KEY = process.env.HF_API_KEY;
  const API_URL =
    "https://api-inference.huggingface.co/models/facebook/bart-large-mnli";

  const body = {
    inputs: content,
    parameters: {
      candidate_labels: mainCategories,
      multi_label: true,
    },
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  if (response.status !== 200) {
    console.error("Hugging Face API error:", result);
    throw new Error("Hugging Face API request failed");
  }

  // Filter categories with confidence > 0.5
  return result.labels
    .filter((_: any, i: number) => result.scores[i] > 0.5)
    .slice(0, 3);
}
