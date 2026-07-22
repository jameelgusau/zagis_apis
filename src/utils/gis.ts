// Distance queries (meters by default 🎯)
// import { fn, col, literal } from "sequelize";

// const nearbySchools = await School.findAll({
//   where: fn(
//     "ST_DWithin",
//     col("location"),
//     literal("ST_SetSRID(ST_MakePoint(500300, 1049200), 32632)"),
//     1000 // meters
//   ),
// });

// ✔ Finds schools within 1 km


// location: {
//   type: "Point",
//   coordinates: [7.49508, 9.05785], // [lng, lat]
// },



// Frontend Usage (Google Maps)
// const { coordinates } = school.location;

// const position = {
//   lat: coordinates[1],
//   lng: coordinates[0],
// };


// function toTitleCase(str: string): string {
//   return str
//     .toLowerCase() // make everything lowercase first
//     .split(' ')    // split by spaces
//     .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize first letter
//     .join(' ');    // join back with spaces
// }

// // Example
// const name = "Shehu gusau";
// console.log(toTitleCase(name)); // Shehu Gusaufunction toTitleCase(str: string): string {
//   return str
//     .toLowerCase() // make everything lowercase first
//     .split(' ')    // split by spaces
//     .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // capitalize first letter
//     .join(' ');    // join back with spaces
// }

// // Example
// const name = "Shehu gusau";
// console.log(toTitleCase(name)); // Shehu Gusau