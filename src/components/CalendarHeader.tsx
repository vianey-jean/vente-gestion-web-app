
import React from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarHeaderProps {
  currentWeek: Date;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentWeek,
  onPreviousWeek,
  onNextWeek,
  onToday
}) => {
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousWeek}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onNextWeek}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="flex items-center gap-2"
        >
          <CalendarIcon className="h-4 w-4" />
          Aujourd'hui
        </Button>
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {format(weekStart, 'MMMM yyyy', { locale: fr })}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {format(weekStart, 'd', { locale: fr })} - {format(weekEnd, 'd MMMM yyyy', { locale: fr })}
        </p>
      </div>

      <div className="w-[140px]"></div>
    </div>
  );
};

export default CalendarHeader;
