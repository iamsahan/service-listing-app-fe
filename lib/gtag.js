// Google Analytics helper
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || "";

// Log a pageview — to be used from client-side code
export const pageview = (url) => {
  if (!GA_MEASUREMENT_ID) return;
  try {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  } catch (e) {
    // noop
  }
};

// Log specific events
export const event = ({ action, category, label, value }) => {
  if (!GA_MEASUREMENT_ID) return;
  try {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  } catch (e) {
    // noop
  }
};

export default GA_MEASUREMENT_ID;
