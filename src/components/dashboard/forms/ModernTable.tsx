import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface ModernTableProps {
  children: React.ReactNode;
  className?: string;
}

const ModernTable: React.FC<ModernTableProps> = ({ children, className }) => {
  return (
    <div className="rounded-xl border-0 overflow-hidden -mx-3 sm:mx-0 bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" style={{ boxShadow: 'var(--shadow-elegant)' }}>
      <Table className={cn("min-w-full", className)}>
        {children}
      </Table>
    </div>
  );
};

const ModernTableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TableHeader className="bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-750 dark:to-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
    {children}
  </TableHeader>
);

const ModernTableRow: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string }> = ({ 
  children, 
  onClick, 
  className 
}) => (
  <TableRow 
    className={cn(
      "hover:bg-gradient-to-r hover:from-blue-50 hover:via-purple-50 hover:to-blue-50",
      "dark:hover:from-blue-950/30 dark:hover:via-purple-950/30 dark:hover:to-blue-950/30",
      "transition-all duration-300 border-b border-gray-100 dark:border-gray-800",
      "hover:border-blue-200 dark:hover:border-blue-800",
      onClick && "cursor-pointer hover:shadow-lg hover:scale-[1.01] transform",
      className
    )}
    onClick={onClick}
  >
    {children}
  </TableRow>
);

const ModernTableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <TableHead className={cn(
    "font-bold text-gray-900 dark:text-gray-100 text-xs sm:text-sm whitespace-nowrap uppercase tracking-wide py-4",
    className
  )}>
    {children}
  </TableHead>
);

const ModernTableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <TableCell className={cn("text-gray-700 dark:text-gray-300 text-xs sm:text-sm whitespace-nowrap py-4 font-medium", className)}>
    {children}
  </TableCell>
);

export { 
  ModernTable, 
  ModernTableHeader, 
  ModernTableRow, 
  ModernTableHead, 
  ModernTableCell, 
  TableBody, 
  TableFooter 
};
