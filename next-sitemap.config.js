const {
  getCities,
  getCategories,
  getSubCategories,
} = require("./api/sitemapApi");

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://prohive.com",
  generateRobotsTxt: true,
  sitemapSize: 50000, // Max URLs
  changefreq: "weekly", // Default change frequency
  priority: 0.7, // Default priority
  exclude: [
    "/admin*",
    "/next-api*",
    "/payment*",
    "/profile*",
    "/docs*",
    "/booking*",
    "/reschedule*",
    "/service-provider*",
    "/registration/customer",
    "/registration/success",
    "/login/admin",
  ],

  // dynamic pages
  additionalPaths: async (_config) => {
    const paths = [];

    // Services main page
    paths.push({ loc: "/services", priority: 0.9 });

    const cities = await getCities();

    for (const city of cities) {
      // City page
      paths.push({ loc: `/services/${city.name}`, priority: 0.8 });

      const categories = await getCategories(city.city_id);
      for (const category of categories) {
        // Category page
        paths.push({
          loc: `/services/${city.name}/${category.slug}`,
          priority: 0.7,
        });

        const subcategories = await getSubCategories(category.category_id);
        for (const subcat of subcategories) {
          // Subcategory page
          paths.push({
            loc: `/services/${city.name}/${category.slug}/${subcat.slug}`,
            priority: 0.6,
          });
        }
      }
    }

    return paths;
  },

  transform: async (config, path) => {
    // Skip all static assets
    if (/\.(png|jpg|jpeg|gif|ico|svg|json)$/i.test(path)) return null;

    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: new Date().toISOString(),
    };
  },
};
