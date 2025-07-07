
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarDayHeaderProps {
  day: Date;
}

const CalendarDayHeader: React.FC<CalendarDayHeaderProps> = ({ day }) => {
  const isToday = new Date().toDateString() === day.toDateString();
  
  return (
    <div className={`p-2 text-center border-b ${isToday ? 'bg-primary/10 font-semibold' : 'bg-muted/50'}`}>
      <div className="text-xs uppercase text-muted-foreground">
        {format(day, 'EEE', { locale: fr })}
      </div>
      <div className={`text-sm ${isToday ? 'text-primary' : ''}`}>
        {format(day, 'd', { locale: fr })}
      </div>
    </div>
  );
};

export default CalendarDayHeader;
