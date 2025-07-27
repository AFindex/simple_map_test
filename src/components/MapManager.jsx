import React, { useState } from 'react'
import './MapManager.css'

const MapManager = ({ maps, onCreateMap, onLoadMap, onDeleteMap, onClose }) => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    width: 20,
    height: 15,
    cellSize: 40
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' ? value : parseInt(value) || 0
    }))
  }

  const handleCreateSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('请输入地图名称')
      return
    }
    
    if (formData.width < 1 || formData.height < 1) {
      alert('地图尺寸必须大于0')
      return
    }
    
    if (formData.cellSize < 10 || formData.cellSize > 100) {
      alert('格子大小必须在10-100像素之间')
      return
    }

    onCreateMap(formData)
    setFormData({ name: '', width: 20, height: 15, cellSize: 40 })
    setShowCreateForm(false)
  }

  const handleDeleteMap = (mapId, mapName) => {
    if (window.confirm(`确定要删除地图"${mapName}"吗？此操作不可撤销。`)) {
      onDeleteMap(mapId)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN')
  }

  return (
    <div className="map-manager-overlay">
      <div className="map-manager">
        <div className="manager-header">
          <h2>地图管理</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="manager-content">
          <div className="manager-section">
            <div className="section-header">
              <h3>创建新地图</h3>
              <button 
                className="toggle-btn"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                {showCreateForm ? '取消' : '新建'}
              </button>
            </div>

            {showCreateForm && (
              <form className="create-form" onSubmit={handleCreateSubmit}>
                <div className="form-row">
                  <label htmlFor="map-name">地图名称:</label>
                  <input
                    id="map-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="输入地图名称"
                    required
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="map-width">宽度 (格子数):</label>
                  <input
                    id="map-width"
                    type="number"
                    name="width"
                    value={formData.width}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    required
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="map-height">高度 (格子数):</label>
                  <input
                    id="map-height"
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    required
                  />
                </div>

                <div className="form-row">
                  <label htmlFor="cell-size">格子大小 (像素):</label>
                  <input
                    id="cell-size"
                    type="number"
                    name="cellSize"
                    value={formData.cellSize}
                    onChange={handleInputChange}
                    min="10"
                    max="100"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="create-btn">
                    创建地图
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="manager-section">
            <h3>已保存的地图 ({maps.length})</h3>
            
            {maps.length === 0 ? (
              <div className="empty-state">
                <p>还没有保存的地图</p>
                <p>创建第一个地图开始使用吧！</p>
              </div>
            ) : (
              <div className="maps-list">
                {maps.map((map) => (
                  <div key={map.id} className="map-item">
                    <div className="map-info">
                      <div className="map-name">{map.name}</div>
                      <div className="map-details">
                        尺寸: {map.width} × {map.height} | 
                        格子: {map.cellSize}px | 
                        创建: {formatDate(map.createdAt)}
                      </div>
                    </div>
                    <div className="map-actions">
                      <button 
                        className="load-btn"
                        onClick={() => onLoadMap(map.id)}
                      >
                        加载
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteMap(map.id, map.name)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapManager
