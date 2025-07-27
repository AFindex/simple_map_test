import React, { useState, useEffect } from 'react'
import './SettingsPanel.css'

const SettingsPanel = ({
  editMode,
  currentBrushColor,
  onBrushColorChange,
  defaultInfo,
  onDefaultInfoChange,
  selectedCell,
  selectedCells,
  onCellUpdate,
  onBatchUpdate,
  onCloseCellEditor
}) => {
  const [cellInfoInput, setCellInfoInput] = useState('')

  // 当选中的格子改变时，更新输入框的值
  useEffect(() => {
    if (selectedCell) {
      setCellInfoInput(selectedCell.info || '')
    }
  }, [selectedCell])
  const presetColors = [
    '#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
    '#008000', '#800000', '#808080', '#c0c0c0', '#808000',
    '#008080', '#000080', '#ffc0cb', '#a52a2a', '#dda0dd'
  ]

  const getModeTitle = () => {
    switch (editMode) {
      case 'single': return '单格编辑'
      case 'paint': return '绘画模式'
      case 'select': return '区域选择'
      case 'fill': return '填充模式'
      default: return '工具设置'
    }
  }

  const getContrastColor = (hexColor) => {
    const hex = hexColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
  }

  return (
    <div className="settings-panel">
      <div className="panel-header">
        <h3>{getModeTitle()}</h3>
      </div>

      <div className="panel-content">
        {/* 画笔设置 - 只在非单格编辑模式下显示 */}
        {editMode !== 'single' && (
          <div className="panel-section">
            <label>画笔颜色</label>
            <div className="color-picker">
              <input
                type="color"
                value={currentBrushColor}
                onChange={(e) => onBrushColorChange(e.target.value)}
                className="custom-color-input"
              />
              <span className="color-value">{currentBrushColor}</span>
            </div>
            <div className="preset-colors">
              <div className="preset-colors-label">预设颜色:</div>
              <div className="color-grid">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    className={`color-preset ${currentBrushColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => onBrushColorChange(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 默认信息设置 - 只在非单格编辑模式下显示 */}
        {editMode !== 'single' && (
          <div className="panel-section">
            <label htmlFor="defaultInfo">默认信息</label>
            <textarea
              id="defaultInfo"
              value={defaultInfo}
              onChange={(e) => onDefaultInfoChange(e.target.value)}
              placeholder="输入默认信息..."
              rows={3}
              className="info-textarea"
            />
          </div>
        )}

        {/* 单格编辑区域 - 只在单格编辑模式下显示 */}
        {editMode === 'single' && selectedCell && (
          <div className="panel-section">
            <div className="section-divider">当前格子</div>
            <div className="editor-section">
              <label>坐标</label>
              <div className="coordinate-display">
                ({selectedCell.x}_{selectedCell.y})
              </div>
            </div>
            <div className="editor-section">
              <label>格子颜色</label>
              <div className="color-picker">
                <input
                  type="color"
                  value={selectedCell.color}
                  onChange={(e) => onCellUpdate({ color: e.target.value })}
                  className="custom-color-input"
                />
                <span className="color-value">{selectedCell.color}</span>
              </div>
              <div className="preset-colors">
                <div className="preset-colors-label">预设颜色:</div>
                <div className="color-grid">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      className={`color-preset ${selectedCell.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => onCellUpdate({ color: color })}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="editor-section">
              <label htmlFor="cellInfo">格子信息</label>
              <div className="info-input-group">
                <textarea
                  id="cellInfo"
                  value={cellInfoInput}
                  onChange={(e) => setCellInfoInput(e.target.value)}
                  placeholder="输入格子的自定义信息..."
                  rows={3}
                  className="info-textarea"
                />
                <div className="info-buttons">
                  <button
                    className="apply-info-btn"
                    onClick={() => onCellUpdate({ info: cellInfoInput })}
                  >
                    应用信息
                  </button>
                  <button
                    className="clear-info-btn"
                    onClick={() => {
                      setCellInfoInput('')
                      onCellUpdate({ info: '' })
                    }}
                  >
                    清除信息
                  </button>
                </div>
              </div>
            </div>
            <div className="editor-section">
              <label>预览</label>
              <div
                className="cell-preview"
                style={{
                  backgroundColor: selectedCell.color,
                  color: getContrastColor(selectedCell.color)
                }}
              >
                <div className="preview-coordinate">
                  {selectedCell.x}_{selectedCell.y}
                </div>
                {selectedCell.info && (
                  <div className="preview-info">
                    {selectedCell.info}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 选择信息 - 填充模式下不显示 */}
        {editMode !== 'fill' && (
          <div className="panel-section">
            <div className="section-divider">选择信息</div>
            <div className="selection-stats">
              已选择: {selectedCells.size} 个格子
            </div>

            {/* 区域选择模式下的批量操作按钮 */}
            {editMode === 'select' && selectedCells.size > 0 && (
              <div className="batch-actions">
                <button
                  className="batch-color-btn"
                  onClick={() => {
                    // 批量应用颜色
                    onBatchUpdate(Array.from(selectedCells), { color: currentBrushColor })
                  }}
                >
                  应用颜色到选择
                </button>
                <button
                  className="batch-info-btn"
                  onClick={() => {
                    // 批量应用信息
                    if (defaultInfo.trim()) {
                      onBatchUpdate(Array.from(selectedCells), { info: defaultInfo.trim() })
                    }
                  }}
                >
                  应用信息到选择
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingsPanel
