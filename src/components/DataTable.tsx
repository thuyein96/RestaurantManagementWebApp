
import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

function DataTable<T>({ columns, data, onEdit, onDelete }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-card">
        <thead className="bg-secondary">
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index} 
                className="px-4 py-2 text-left text-foreground font-medium"
              >
                {column.header}
              </th>
            ))}
            {(onEdit || onDelete) && <th className="px-4 py-2">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((item, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-muted transition-colors">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-4 py-2">
                  {column.render
                    ? column.render(item)
                    : (item[column.accessor] as React.ReactNode)}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="flex space-x-2">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(item)}
                        className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/80"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(item)}
                        className="px-3 py-1 text-xs bg-destructive text-destructive-foreground rounded hover:bg-destructive/80"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td 
                colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
