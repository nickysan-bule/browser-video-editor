import React from 'react';
import { CaptionStyle } from '../utils/videoUtils';
import styles from '../App.module.css';

interface StyleControlsProps {
  style: CaptionStyle;
  onChange: (style: CaptionStyle) => void;
  disabled?: boolean;
}

export const StyleControls: React.FC<StyleControlsProps> = ({
  style,
  onChange,
  disabled = false,
}) => {
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...style, fontSize: Number(e.target.value) });
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...style, primaryColor: e.target.value });
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'bottom' | 'top' | 'middle';
    onChange({ ...style, position: value });
  };

  return (
    <div className={`${styles.styleControls} ${disabled ? styles.disabled : ''}`}>
      <div className={styles.controlGroup}>
        <label className={styles.controlLabel} htmlFor="fontSize">
          Font Size
        </label>
        <input
          id="fontSize"
          type="number"
          min="12"
          max="72"
          value={style.fontSize}
          onChange={handleFontSizeChange}
          disabled={disabled}
          className={styles.controlInput}
        />
      </div>

      <div className={styles.controlGroup}>
        <label className={styles.controlLabel} htmlFor="color">
          Color
        </label>
        <input
          id="color"
          type="color"
          value={style.primaryColor}
          onChange={handleColorChange}
          disabled={disabled}
          className={styles.controlInput}
          style={{ height: '38px', cursor: 'pointer' }}
        />
      </div>

      <div className={styles.controlGroup}>
        <label className={styles.controlLabel} htmlFor="position">
          Position
        </label>
        <select
          id="position"
          value={style.position}
          onChange={handlePositionChange}
          disabled={disabled}
          className={styles.controlInput}
        >
          <option value="bottom">Bottom</option>
          <option value="middle">Middle</option>
          <option value="top">Top</option>
        </select>
      </div>
    </div>
  );
};
