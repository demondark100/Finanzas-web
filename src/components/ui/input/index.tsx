"use client";

import React, { useState, useRef } from "react";
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
  defaultValue,
  id,
  onChange,
  onInput,
  ...props
}: InputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasValue, setHasValue] = useState(Boolean(defaultValue));
  const [showPassword, setShowPassword] = useState(false);

  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    setHasValue(Boolean(e.currentTarget.value));
    (onInput as unknown as (ev: React.FormEvent<HTMLInputElement>) => void)?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(Boolean(e.target.value));
    onChange?.(e);
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
      setHasValue(false);
      // Disparar evento synthetic change para listeners
      const event = new Event("input", { bubbles: true });
      inputRef.current.dispatchEvent(event);
    }
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
          ref={inputRef}
          id={inputId}
          type={actualType}
          defaultValue={defaultValue}
          onInput={handleInput}
          onChange={handleChange}
          className={`${styles.input} ${error ? styles.inputError : ""} ${className}`.trim()}
          {...props}
        />
        <div className={styles.actions}>
          {clearable && hasValue && (
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
