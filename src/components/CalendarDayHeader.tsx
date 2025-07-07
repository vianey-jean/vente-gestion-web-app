
import React from 'react';
import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarDayHeaderProps {
  day: Date;
}

const CalendarDayHeader: React.FC<CalendarDayHeaderProps> = ({ day }) => {
  const isCurrentDay = isToday(day);

  return (
    <div className={`border-r last:border-r-0 p-4 text-center ${
      isCurrentDay 
        ? 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30' 
        : 'bg-gray-50 dark:bg-gray-800/50'
    }`}>
      <div className="font-semibold text-gray-900 dark:text-gray-100">
        {format(day, 'EEEE', { locale: fr })}
      </div>
      <div className={`text-2xl font-bold mt-1 ${
        isCurrentDay 
          ? 'text-purple-600 dark:text-purple-400' 
          : 'text-gray-700 dark:text-gray-300'
      }`}>
        {format(day, 'd', { locale: fr })}
      </div>
    </div>
  );
};

export default CalendarDayHeader;
