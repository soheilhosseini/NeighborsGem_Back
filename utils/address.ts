export const distanceCalculator = (coords: number[][]) => {
  if (!Array.isArray(coords) || coords.length !== 2) {
    throw new Error("Input must be an array with two coordinates");
  }

  const [[lon1, lat1], [lon2, lat2]] = coords; // Extracting longitude & latitude

  const R = 6371; // Radius of the Earth in km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c * 1000; // Distance in m
};

function toRadians(deg: number) {
  return deg * (Math.PI / 180);
}
