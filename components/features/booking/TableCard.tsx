'use client';

import { Users, MapPin } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import type { TableAvailability } from '@/types';

interface TableCardProps {
  table: TableAvailability;
  onSelect: (table: TableAvailability) => void;
  selected?: boolean;
}

export function TableCard({ table, onSelect, selected }: TableCardProps) {
  return (
    <Card
      hoverable
      onClick={() => table.isAvailable && onSelect(table)}
      className={`relative ${
        selected
          ? 'ring-2 ring-accent'
          : table.isAvailable
          ? ''
          : 'opacity-50 cursor-not-allowed'
      }`}
    >
      {!table.isAvailable && (
        <div className="absolute top-2 right-2">
          <Badge variant="error">Занято</Badge>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-gray-600" />
            <span className="font-semibold">{table.location}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>До {table.seats} человек</span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-accent">#{table.id}</div>
          {table.nextAvailableTime && (
            <div className="text-xs text-gray-500 mt-1">
              Свободен с {new Date(table.nextAvailableTime).toLocaleTimeString('ru', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
