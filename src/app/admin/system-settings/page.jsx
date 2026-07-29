"use client";
import { settingsApi } from "@/api/settings";
import React, { useState, useEffect } from "react";

const SystemSettings = () => {
  const [settings, setSettings] = useState([]);
  const [tempValues, setTempValues] = useState({});
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        const response = await settingsApi.getAllSettings();
        setSettings(response.data);
        // Initialize temp values with current values
        const initialTempValues = {};
        response.data.forEach((setting) => {
          initialTempValues[setting.key] = JSON.parse(setting.value);
        });
        setTempValues(initialTempValues);
      } catch (error) {
        console.error("Error fetching system settings", error);
      }
    };

    fetchSystemSettings();
  }, []);

  const handleValueChange = (key, newValue) => {
    setTempValues((prev) => ({
      ...prev,
      [key]: newValue,
    }));
  };

  const handleUpdateSetting = async (key) => {
    try {
      setUpdating((prev) => ({ ...prev, [key]: true }));

      const newValue = tempValues[key];

      // Update local state
      const updatedSettings = settings.map((setting) =>
        setting.key === key
          ? { ...setting, value: JSON.stringify(newValue) }
          : setting
      );
      setSettings(updatedSettings);

      // API Call
      await settingsApi.updateSetting(key, { value: newValue });

      console.log("Setting updated successfully:", key, newValue);
    } catch (error) {
      console.error("Error updating setting:", error);
    } finally {
      setUpdating((prev) => ({ ...prev, [key]: false }));
    }
  };

  const hasChanges = (key, originalValue) => {
    return tempValues[key] !== JSON.parse(originalValue);
  };

  // Categorize settings
  const categorizedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) acc[setting.category] = [];
    acc[setting.category].push(setting);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl ml-20 mt-10 p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-10">
        System Settings
      </h2>

      {Object.entries(categorizedSettings).map(([category, settings]) => (
        <div key={category} className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 border-b-2 border-gray-300 pb-2 mb-4 capitalize">
            {category}
          </h3>

          <div className="space-y-4">
            {settings.map(({ key, value, data_type, description }) => (
              <div
                key={key}
                className="p-4 rounded-lg border bg-white shadow-sm"
              >
                <p className="text-gray-700 font-medium capitalize mb-3">
                  {description}
                </p>

                <div className="flex items-center gap-3">
                  {data_type === "boolean" ? (
                    <div className="flex items-center justify-between flex-1">
                      <span className="text-gray-600">
                        {tempValues[key] ? "Enabled" : "Disabled"}
                      </span>
                      <label className="relative inline-flex cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={tempValues[key] || false}
                          onChange={(e) =>
                            handleValueChange(key, e.target.checked)
                          }
                        />
                        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      </label>
                    </div>
                  ) : (
                    <input
                      type="number"
                      className="flex-1 p-2 border rounded-lg"
                      value={tempValues[key] || 0}
                      onChange={(e) =>
                        handleValueChange(key, Number(e.target.value))
                      }
                    />
                  )}

                  <button
                    onClick={() => handleUpdateSetting(key)}
                    disabled={!hasChanges(key, value) || updating[key]}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      hasChanges(key, value) && !updating[key]
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {updating[key] ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SystemSettings;
