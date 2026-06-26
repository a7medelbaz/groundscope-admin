"use client";

import React, { useState, useRef } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function TagInput({ value, onChange, placeholder = "Add tag...", disabled }: TagInputProps) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmed = input.trim().toUpperCase();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInput("");
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-2 border border-border rounded-control bg-background min-h-10">
        {value.map((tag) => (
          <div
            key={tag}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-primary-200/15 border border-primary-200/30 rounded-chip text-sm font-medium text-primary-200"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:text-primary-300 transition-colors"
              type="button"
              disabled={disabled}
            >
              <X className="w-3 h-3" strokeWidth={3} />
            </button>
          </div>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-24 bg-transparent text-text-primary placeholder:text-text-hint outline-none text-sm"
          disabled={disabled}
        />
      </div>
      <p className="text-xs text-text-hint">Press Enter or comma to add tags</p>
    </div>
  );
}
