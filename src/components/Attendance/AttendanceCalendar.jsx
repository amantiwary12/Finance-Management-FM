import React from 'react';

const STATUS_STYLES = {
  Present: 'bg-emerald-500 text-white',
  Absent: 'bg-red-500 text-white',
  'Half Day': 'bg-amber-400 text-white',
  Late: 'bg-orange-500 text-white',
};

const STATUS_LEGEND = [
  { label: 'Present', className: 'bg-emerald-500' },
  { label: 'Absent', className: 'bg-red-500' },
  { label: 'Half Day', className: 'bg-amber-400' },
  { label: 'Late', className: 'bg-orange-500' },
  { label: 'Weekend', className: 'bg-gray-200' },
  { label: 'No data', className: 'bg-white border border-gray-300' },
];

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// year: full year (e.g. 2026), month: 1-12, records: [{ date, status }]
// onDayClick(day): optional — when provided, day cells become clickable (used for HR/Admin manual edits)
const AttendanceCalendar = ({ year, month, records = [], loading = false, onDayClick = null }) => {
  const recordsByDay = {};
  records.forEach((r) => {
    const d = new Date(r.date);
    recordsByDay[d.getUTCDate()] = r.status;
  });

  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const firstWeekday = (firstOfMonth.getUTCDay() + 6) % 7; // Mon=0 .. Sun=6
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);

  const isWeekend = (day) => {
    const wd = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    return wd === 0 || wd === 6;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-7 gap-2 animate-pulse">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`blank-${idx}`} />;

          const status = recordsByDay[day];
          const weekend = isWeekend(day);
          let className = 'bg-white border border-gray-200 text-gray-400';
          if (status && STATUS_STYLES[status]) {
            className = STATUS_STYLES[status];
          } else if (weekend) {
            className = 'bg-gray-100 text-gray-400';
          }

          return (
            <div
              key={day}
              onClick={onDayClick ? () => onDayClick(day) : undefined}
              title={onDayClick ? 'Click to edit' : status || (weekend ? 'Weekend' : 'No data')}
              className={`h-14 rounded-lg flex flex-col items-center justify-center text-sm font-semibold transition-colors ${className} ${
                onDayClick ? 'cursor-pointer hover:ring-2 hover:ring-blue-400' : ''
              }`}
            >
              <span>{day}</span>
              {status && (
                <span className="text-[9px] font-normal leading-none mt-0.5">
                  {status === 'Half Day' ? 'Half' : status}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 mt-4">
        {STATUS_LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`w-3 h-3 rounded ${l.className}`} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceCalendar;
