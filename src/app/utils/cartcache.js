const STORAGE_KEY = "selectedItems";
const GUEST_STORAGE_KEY = "guestSelectedItems";

const getStorage = (userId) => (userId ? localStorage : sessionStorage);
const getKey = (userId) => (userId ? STORAGE_KEY : GUEST_STORAGE_KEY);

export const getAllCartEntries = (userId) => {
  try {
    const storage = getStorage(userId);
    const key = getKey(userId);
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to parse cart cache:", e);
    return [];
  }
};

export const getUserCartEntries = (userId) => {
  const all = getAllCartEntries(userId);
  return userId ? all.filter((entry) => entry.userId === userId) : all;
};

export const removeUserCartEntry = (userId, cityName, subCategory) => {
  const all = getAllCartEntries(userId);
  const updated = all.filter((entry) => {
    const normalizedEntrySubCat = decodeURIComponent(
      entry.subCategorySlug || ""
    ).toLowerCase();
    const normalizedSubCat = decodeURIComponent(
      subCategory || ""
    ).toLowerCase();

    return !(
      entry.userId === userId &&
      entry.cityName.toLowerCase() === cityName.toLowerCase() &&
      normalizedEntrySubCat === normalizedSubCat
    );
  });

  const storage = getStorage(userId);
  const key = getKey(userId);
  storage.setItem(key, JSON.stringify(updated));
};

export const getUserCartEntriesByCityAndSubCategory = (
  userId,
  cityName,
  subCategory
) => {
  const all = getAllCartEntries(userId);
  return userId
    ? all.filter(
        (entry) =>
          entry.userId === userId &&
          entry.cityName === cityName &&
          entry.subCategorySlug === subCategory
      )
    : all;
};

export const setUserCartEntries = (userId, userEntries) => {
  const storage = getStorage(userId);
  const key = getKey(userId);

  if (userId) {
    const all = getAllCartEntries(userId);
    const others = all.filter((entry) => entry.userId !== userId);
    const updated = [...others, ...userEntries];
    storage.setItem(key, JSON.stringify(updated));
  } else {
    // Guest: overwrite completely
    storage.setItem(key, JSON.stringify(userEntries));
  }
};

export const clearUserCartEntries = (userId) => {
  const storage = getStorage(userId);
  const key = getKey(userId);

  if (userId) {
    const all = getAllCartEntries(userId);
    const updated = all.filter((entry) => entry.userId !== userId);
    storage.setItem(key, JSON.stringify(updated));
  } else {
    storage.removeItem(key);
  }
};

export const updateUserCartEntry = (userId, newEntry) => {
  if (!newEntry) return;

  const all = getAllCartEntries(userId);
  const updated = all.filter(
    (entry) =>
      !(
        entry.userId === userId &&
        entry.subCategorySlug === newEntry.subCategorySlug &&
        entry.cityName === newEntry.cityName
      )
  );

  updated.push({ ...newEntry, ...(userId ? { userId } : {}) });

  const storage = getStorage(userId);
  const key = getKey(userId);
  storage.setItem(key, JSON.stringify(updated));
};

export const mergeGuestCartToUserCart = (userId) => {
  if (!userId) return;

  const guestRaw = sessionStorage.getItem(GUEST_STORAGE_KEY);
  if (!guestRaw) return;

  try {
    const guestCart = JSON.parse(guestRaw) || [];

    // Add userId to each guest cart entry
    const updatedGuestCart = guestCart.map((entry) => ({
      ...entry,
      userId,
    }));

    // Get existing user cart from localStorage
    const existingUserCart = getAllCartEntries(userId);

    // Merge and deduplicate based on subCategorySlug + cityName
    const mergedCart = [
      ...existingUserCart.filter(
        (e) =>
          !updatedGuestCart.some(
            (g) =>
              g.subCategorySlug === e.subCategorySlug &&
              g.cityName === e.cityName
          )
      ),
      ...updatedGuestCart,
    ];

    // Save merged cart to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedCart));

    // Clear guest cart
    sessionStorage.removeItem(GUEST_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to merge guest cart:", e);
  }
};
