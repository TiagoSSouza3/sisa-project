import React from 'react';

/**
 * Accessible toggle switch component with consistent styling.
 * Props:
 * - checked: boolean
 * - onChange: function(boolean)
 * - label: string (aria-label)
 * - onLabel: string (text when enabled)
 * - offLabel: string (text when disabled)
 * - id: optional string
 */
export default function ToggleSwitch({ checked, onChange, label, onLabel = 'Permitido', offLabel = 'Negado', id }) {
  const inputId = id || `toggle-${Math.random().toString(36).slice(2)}`;
  return (
    <div className="toggle-switch-container">
      <label className={`toggle-switch ${checked ? 'enabled' : 'disabled'}`} htmlFor={inputId} title={label}>
        <input
          id={inputId}
          type="checkbox"
          checked={!!checked}
          onChange={(e) => onChange && onChange(e.target.checked)}
          aria-label={label}
        />
        <span className="toggle-slider">
          <span className="toggle-knob"></span>
        </span>
        <span className="toggle-text">{checked ? onLabel : offLabel}</span>
      </label>
    </div>
  );
}
