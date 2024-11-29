export function getTopFiveReviews(reviews) {
  return reviews
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by date descending
    .slice(0, 5); // Get the first 5 items
}
