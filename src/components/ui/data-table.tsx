import React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  getRowKey?: (row: T) => string;
}

export function DataTable<T>({ columns, data, getRowKey }: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: getRowKey ? (row) => getRowKey(row) : undefined,
  });

  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return (
      <div className="border border-divider rounded-control p-8 text-center">
        <p className="text-text-hint text-sm">No records found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-divider rounded-control">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-divider">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-4 text-start text-sm font-semibold text-text-secondary"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-divider hover:bg-surface-variant transition-colors last:border-b-0"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-4 text-sm text-text-primary">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
