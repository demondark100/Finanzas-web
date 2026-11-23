"use client";

import React from "react";
import styles from "./pin-pad.module.css";

interface PinPadProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  onComplete?: (val: string) => void;
  disabled?: boolean;
}

export function PinPad({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
}: PinPadProps) {
  const handleDigit = (digit: string) => {
    if (disabled || value.length >= length) return;
    const nextVal = value + digit;
    onChange(nextVal);
    if (nextVal.length === length && onComplete) {
      onComplete(nextVal);
    }
  };

  const handleDelete = () => {
    if (disabled || value.length === 0) return;
    onChange(value.slice(0, -1));
  };

  return (
    <div className={styles.container}>
      {/* Indicadores de bolitas */}
      <div className={styles.dotsContainer}>
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`${styles.dot} ${i < value.length ? styles.dotFilled : ""}`}
          />
        ))}
      </div>

      {/* Teclado numérico táctil 3x4 */}
      <div className={styles.grid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            type="button"
            className={styles.key}
            onClick={() => handleDigit(num.toString())}
            disabled={disabled}
          >
            {num}
          </button>
        ))}
        <button
          type="button"
          className={`${styles.key} ${styles.keySpecial}`}
          onClick={() => onChange("")}
          disabled={disabled || value.length === 0}
        >
          Borrar
        </button>
        <button
          type="button"
          className={styles.key}
          onClick={() => handleDigit("0")}
          disabled={disabled}
        >
          0
        </button>
        <button
          type="button"
          className={`${styles.key} ${styles.keySpecial}`}
          onClick={handleDelete}
          disabled={disabled || value.length === 0}
        >
          ⌫
        </button>
      </div>
    </div>
  );
}
