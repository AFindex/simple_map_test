import React, { useState, useEffect } from 'react'
import './CellEditor.css'

const CellEditor = ({ cell, onUpdate, onClose }) => {
  const [color, setColor] = useState(cell.color)
  const [info, setInfo] = useState(cell.info)

  // 预设颜色
  const presetColors = [
    '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
    '#008000', '#800000', '#808080', '#c0c0c0', '#808000',
    '#008080', '#000080', '#ffc0cb', '#a52a2a', '#dda0dd'
  ]

  useEffect(() => {
    setColor(cell.color)
    setInfo(cell.info)
  }, [cell])

  const handleColorChange = (newColor) => {
    setColor(newColor)
    onUpdate({ color: newColor })
  }

  const handleInfoChange = (e) => {
    const newInfo = e.target.value
    setInfo(newInfo)
    onUpdate({ info: newInfo })
  }

  const handleCustomColorChange = (e) => {
    const newColor = e.target.value
    setColor(newColor)
    onUpdate({ color: newColor })
  }

  return (
    <div className="cell-editor">
      <div className="editor-header">
        <h3>编辑格子</h3>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="editor-content">
        <div className="editor-section">
          <label>坐标</label>
          <div className="coordinate-display">
            ({cell.x}, {cell.y})
          </div>
        </div>

        <div className="editor-section">
          <label>颜色</label>
          <div className="color-picker">
            <input
              type="color"
              value={color}
              onChange={handleCustomColorChange}
              className="custom-color-input"
            />
            <span className="color-value">{color}</span>
          </div>
          
          <div className="preset-colors">
            <div className="preset-colors-label">预设颜色:</div>
            <div className="color-grid">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  className={`color-preset ${color === presetColor ? 'selected' : ''}`}
                  style={{ backgroundColor: presetColor }}
                  onClick={() => handleColorChange(presetColor)}
                  title={presetColor}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="editor-section">
          <label htmlFor="cell-info">自定义信息</label>
          <textarea
            id="cell-info"
            value={info}
            onChange={handleInfoChange}
            placeholder="输入格子的自定义信息..."
            rows={4}
            className="info-textarea"
          />
        </div>

        <div className="editor-section">
          <label>预览</label>
          <div 
            className="cell-preview"
            style={{ 
              backgroundColor: color,
              color: getContrastColor(color)
            }}
          >
            <div className="preview-coordinate">
              {cell.x},{cell.y}
            </div>
            {info && (
              <div className="preview-info">
                {info}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 根据背景色计算对比色
const getContrastColor = (hexColor) => {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#000000' : '#ffffff'
}

export default CellEditor
