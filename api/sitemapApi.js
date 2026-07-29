const axios = require("axios");

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
if (!BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

async function getCities() {
  try {
    const res = await axios.get(`${BASE_URL}/cities`);
    return res.data;
  } catch (error) {
    console.warn("Could not fetch cities for sitemap generation. Ensure backend is running. Returning empty data.");
    return [];
  }
}

async function getCategories(cityId) {
  try {
    const res = await axios.get(`${BASE_URL}/categories?city_id=${cityId}`);
    return res.data;
  } catch (error) {
    console.warn(`Could not fetch categories for city ${cityId}. Returning empty data.`);
    return [];
  }
}

async function getSubCategories(categoryId) {
  try {
    const res = await axios.get(
      `${BASE_URL}/categories/${categoryId}/subcategories`
    );
    return res.data;
  } catch (error) {
    console.warn(`Could not fetch subcategories for category ${categoryId}. Returning empty data.`);
    return [];
  }
}

module.exports = {
  getCities,
  getCategories,
  getSubCategories,
};
