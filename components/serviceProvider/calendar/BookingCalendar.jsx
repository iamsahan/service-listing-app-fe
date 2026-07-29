"use client";

import { Calendar, momentLocalizer } from "react-big-calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment";
import React from "react";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";

const localizer = momentLocalizer(moment);

const BookingCalendar = ({
  bookingDates,
  view,
  onViewChange,
  date,
  onNavigate,
  onSelectEvent,
}) => {
  // current month name
  const currentMonth = moment(date).format("MMM");

  const handlePrev = () => {
    const newDate = moment(date).subtract(1, "month").toDate();
    onNavigate(newDate);
  };

  const handleNext = () => {
    const newDate = moment(date).add(1, "month").toDate();
    onNavigate(newDate);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold flex items-center gap-4">
          Schedule
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-1 rounded hover:bg-gray-100 transition"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium">{currentMonth}</span>
          <button
            onClick={handleNext}
            className="p-1 rounded hover:bg-gray-100 transition"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <Calendar
        localizer={localizer}
        events={bookingDates}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 350 }}
        view={view}
        onView={onViewChange}
        onSelectEvent={onSelectEvent}
        date={date}
        toolbar={false}
        className="no-border-calendar bg-gray-50"
      />
    </div>
  );
};

export default BookingCalendar;
