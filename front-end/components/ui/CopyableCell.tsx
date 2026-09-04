/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";

interface CopyableCellProps {
  /** Full value that should be copied / shown on hover */
  value: string;
  /** Optional label shown before the value */
  label?: string;
  /** Display the value truncated with ellipsis */
  truncate?: boolean;
  /** Maximum characters to show before truncating */
  maxChars?: number;
  className?: string;
}

/**
 * A cell that shows a truncated value (or label + value) with a tooltip on
 * hover revealing the full value, and copies the full value to the clipboard
 * when clicked.
 */
const CopyableCell: React.FC<CopyableCellProps> = ({
  value,
  label,
  truncate = true,
  maxChars = 12,
  className = "",
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: still let user know
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayValue =
    truncate && value.length > maxChars
      ? `${value.slice(0, maxChars)}...`
      : value;

  const cellContent = label ? `${label} ${displayValue}` : displayValue;
  const tooltipText = label ? `${label} ${value}` : value;

  return (
    <span
      onClick={handleCopy}
      className={`relative cursor-pointer inline-flex items-center gap-1.5 text-xs font-mono text-slate-700 ${className}`}
      title={tooltipText}
    >
      {cellContent}
      <span className="transition-opacity">
        {copied ? (
          <FiCheck className="w-3 h-3 text-emerald-500" />
        ) : (
          <FiCopy className="w-3 h-3 text-slate-400 hover:text-slate-600" />
        )}
      </span>
    </span>
  );
};

export default CopyableCell;