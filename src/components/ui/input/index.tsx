"use client";

import React, { useState } from "react";
import styles from "./input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  clearable?: boolean;
}

export function Input({
  label,
  error,
  type = "text",
  clearable = true,
  className = "",
  value: controlledValue,
  defaultValue,
  onChange,
  id,
  ...props
}: InputProps) {
  const [internalValue, setInternalValue] = useState(
    defaultValue !== undefined ? String(defaultValue) : ""
  );
  const [showPassword, setShowPassword] = useState(false);

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? String(controlledValue) : internalValue;

  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalValue(e.target.value);
    onChange?.(e);
  };

  const handleClear = () => {
    if (!isControlled) setInternalValue("");
    const syntheticEvent = {
      target: { value: "" },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange?.(syntheticEvent);
  };

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputWrapper}>
        <input
          id={inputId}
          type={actualType}
          value={isControlled ? controlledValue : internalValue}
          onChange={handleChange}
          className={`${styles.input} ${error ? styles.inputError : ""} ${className}`.trim()}
          {...props}
        />
        <div className={styles.actions}>
          {clearable && currentValue.length > 0 && (
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleClear}
              aria-label="Borrar texto"
            >
              ✕
            </button>
          )}
          {isPassword && (
            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          )}
        </div>
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
