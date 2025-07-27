import React, { useState } from 'react'
import './PresetManager.css'

const PresetManager = ({
  presets,
  onApplyPreset,
  onAddPreset,
  onDeletePreset,
  onClose,
  currentBrushColor,
  defaultInfo,
  isPanel = false
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPreset, setNewPreset] = useState({
    name: '',
    color: currentBrushColor,
    info: defaultInfo
  })

  const handleAddPreset = (e) => {
    e.preventDefault()

    if (!newPreset.name.trim()) {
      alert('请输入预设名称')
      return
    }

    onAddPreset(newPreset)
    setNewPreset({
      name: '',
      color: currentBrushColor,
      info: defaultInfo
    })
    setShowAddForm(false)
  }

  const handleDeletePreset = (presetId, presetName) => {
    if (window.confirm(`确定要删除预设"${presetName}"吗？`)) {
      onDeletePreset(presetId)
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

  if (isPanel) {
    return (
      <div className="preset-panel-content">
        <div className="preset-panel-header">
          <h3>地块预设</h3>
          <button
            className="add-preset-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '取消' : '添加'}
          </button>
        </div>

        <div className="preset-panel-body">
          {showAddForm && (
            <form className="add-preset-form-compact" onSubmit={handleAddPreset}>
              <input
                type="text"
                value={newPreset.name}
                onChange={(e) => setNewPreset({ ...newPreset, name: e.target.value })}
                placeholder="预设名称"
                required
              />
              <div className="color-input-compact">
                <input
                  type="color"
                  value={newPreset.color}
                  onChange={(e) => setNewPreset({ ...newPreset, color: e.target.value })}
                />
              </div>
              <input
                type="text"
                value={newPreset.info}
                onChange={(e) => setNewPreset({ ...newPreset, info: e.target.value })}
                placeholder="信息"
              />
              <button type="submit" className="save-preset-btn-compact">保存</button>
            </form>
          )}

          <div className="presets-list">
            {presets.map((preset) => (
              <div key={preset.id} className="preset-item-compact">
                <div
                  className="preset-color-indicator"
                  style={{ backgroundColor: preset.color }}
                  title={preset.color}
                />
                <div className="preset-info-compact">
                  <div className="preset-name-compact">{preset.name}</div>
                  <div className="preset-text-compact">{preset.info || '无信息'}</div>
                </div>
                <div className="preset-actions-compact">
                  <button
                    className="apply-btn-compact"
                    onClick={() => onApplyPreset(preset)}
                    title="应用预设"
                  >
                    应用
                  </button>
                  <button
                    className="delete-btn-compact"
                    onClick={() => handleDeletePreset(preset.id, preset.name)}
                    title="删除预设"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          {presets.length === 0 && (
            <div className="empty-presets-compact">
              <p>暂无预设</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="preset-manager-overlay">
      <div className="preset-manager">
        <div className="preset-header">
          <h2>地块预设管理</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="preset-content">
          <div className="preset-section">
            <div className="section-header">
              <h3>当前预设 ({presets.length})</h3>
              <button
                className="add-preset-btn"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                {showAddForm ? '取消' : '添加预设'}
              </button>
            </div>

            {showAddForm && (
              <form className="add-preset-form" onSubmit={handleAddPreset}>
                <div className="form-row">
                  <label htmlFor="preset-name">预设名称:</label>
                  <input
                    id="preset-name"
                    type="text"
                    value={newPreset.name}
                    onChange={(e) => setNewPreset({ ...newPreset, name: e.target.value })}
                    placeholder="输入预设名称"
                    required
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="preset-color">颜色:</label>
                  <div className="color-input-group">
                    <input
                      id="preset-color"
                      type="color"
                      value={newPreset.color}
                      onChange={(e) => setNewPreset({ ...newPreset, color: e.target.value })}
                    />
                    <span className="color-value">{newPreset.color}</span>
                  </div>
                </div>
                <div className="form-row">
                  <label htmlFor="preset-info">信息:</label>
                  <input
                    id="preset-info"
                    type="text"
                    value={newPreset.info}
                    onChange={(e) => setNewPreset({ ...newPreset, info: e.target.value })}
                    placeholder="输入预设信息"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="save-preset-btn">
                    保存预设
                  </button>
                </div>
              </form>
            )}

            <div className="presets-grid">
              {presets.map((preset) => (
                <div key={preset.id} className="preset-item">
                  <div
                    className="preset-preview"
                    style={{
                      backgroundColor: preset.color,
                      color: getContrastColor(preset.color)
                    }}
                  >
                    <div className="preset-name">{preset.name}</div>
                    <div className="preset-info-preview">{preset.info || '无信息'}</div>
                  </div>
                  <div className="preset-details">
                    <div className="preset-color-info">
                      <span>颜色: {preset.color}</span>
                    </div>
                    <div className="preset-actions">
                      <button
                        className="apply-preset-btn"
                        onClick={() => onApplyPreset(preset)}
                      >
                        应用
                      </button>
                      <button
                        className="delete-preset-btn"
                        onClick={() => handleDeletePreset(preset.id, preset.name)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {presets.length === 0 && (
              <div className="empty-presets">
                <p>还没有地块预设</p>
                <p>点击"添加预设"创建第一个预设</p>
              </div>
            )}
          </div>

          <div className="preset-help">
            <h4>使用说明:</h4>
            <ul>
              <li>点击"应用"将预设的颜色和信息设置为当前画笔</li>
              <li>可以在任何编辑模式下使用预设</li>
              <li>预设会随地图一起保存</li>
            </ul>
          </div>
        </div >
      </div >
    </div >
  )
}

export default PresetManager
