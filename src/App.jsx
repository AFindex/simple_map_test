import React, { useState, useEffect } from 'react'
import MapGrid from './components/MapGrid'
import MapManager from './components/MapManager'
import SettingsPanel from './components/SettingsPanel'
import PresetManager from './components/PresetManager'
import './App.css'

function App() {
  const [maps, setMaps] = useState([])
  const [currentMap, setCurrentMap] = useState(null)
  const [selectedCell, setSelectedCell] = useState(null)
  const [selectedCells, setSelectedCells] = useState(new Set())
  const [showMapManager, setShowMapManager] = useState(false)
  const [editMode, setEditMode] = useState('single') // single, paint, select, fill
  const [currentBrushColor, setCurrentBrushColor] = useState('#ff0000')
  const [defaultInfo, setDefaultInfo] = useState('')
  const [isPickerMode, setIsPickerMode] = useState(false) // 拾色器模式
  const [showPresetPanel, setShowPresetPanel] = useState(false) // 预设面板
  const [showCoordinates, setShowCoordinates] = useState(true) // 显示坐标
  const [showInfo, setShowInfo] = useState(true) // 显示信息

  // 切换编辑模式时清除选择状态
  const changeEditMode = (newMode) => {
    setEditMode(newMode)
    // 清除单格选择
    setSelectedCell(null)
    // 清除多格选择
    setSelectedCells(new Set())
    // 退出拾色器模式
    setIsPickerMode(false)
  }

  // 从localStorage加载地图数据
  useEffect(() => {
    const savedMaps = localStorage.getItem('mapCreatorMaps')
    if (savedMaps) {
      try {
        const parsedMaps = JSON.parse(savedMaps)
        setMaps(parsedMaps)
      } catch (error) {
        console.error('加载地图数据失败:', error)
      }
    }
  }, [])

  // 保存地图数据到localStorage
  const saveMapsToStorage = (mapsData) => {
    localStorage.setItem('mapCreatorMaps', JSON.stringify(mapsData))
  }

  // 创建新地图
  const createNewMap = (config) => {
    const newMap = {
      id: Date.now().toString(),
      name: config.name,
      width: config.width,
      height: config.height,
      cellSize: config.cellSize,
      createdAt: new Date().toISOString(),
      cells: {},
      presets: [
        // 默认预设
        { id: '1', name: '草地', color: '#00ff00', info: '草地' },
        { id: '2', name: '水域', color: '#0000ff', info: '水域' },
        { id: '3', name: '山地', color: '#8b4513', info: '山地' },
        { id: '4', name: '沙漠', color: '#ffff00', info: '沙漠' },
        { id: '5', name: '森林', color: '#006400', info: '森林' }
      ]
    }

    // 初始化所有格子
    for (let x = 0; x < config.width; x++) {
      for (let y = 0; y < config.height; y++) {
        const key = `${x}_${y}`
        newMap.cells[key] = {
          x,
          y,
          color: '#ffffff',
          info: ''
        }
      }
    }

    const updatedMaps = [...maps, newMap]
    setMaps(updatedMaps)
    saveMapsToStorage(updatedMaps)
    setCurrentMap(newMap)
    setShowMapManager(false)
  }

  // 加载地图
  const loadMap = (mapId) => {
    const map = maps.find(m => m.id === mapId)
    if (map) {
      // 确保地图有presets数组（兼容旧地图）
      if (!map.presets) {
        map.presets = [
          { id: '1', name: '草地', color: '#00ff00', info: '草地' },
          { id: '2', name: '水域', color: '#0000ff', info: '水域' },
          { id: '3', name: '山地', color: '#8b4513', info: '山地' },
          { id: '4', name: '沙漠', color: '#ffff00', info: '沙漠' },
          { id: '5', name: '森林', color: '#006400', info: '森林' }
        ]
      }
      setCurrentMap(map)
      setShowMapManager(false)
    }
  }

  // 删除地图
  const deleteMap = (mapId) => {
    const updatedMaps = maps.filter(m => m.id !== mapId)
    setMaps(updatedMaps)
    saveMapsToStorage(updatedMaps)
    if (currentMap && currentMap.id === mapId) {
      setCurrentMap(null)
    }
  }

  // 更新格子数据
  const updateCell = (x, y, updates) => {
    if (!currentMap) return

    const key = `${x}_${y}`
    const updatedMap = {
      ...currentMap,
      cells: {
        ...currentMap.cells,
        [key]: {
          ...currentMap.cells[key],
          ...updates
        }
      }
    }

    setCurrentMap(updatedMap)

    // 更新maps数组中的地图
    const updatedMaps = maps.map(map =>
      map.id === currentMap.id ? updatedMap : map
    )
    setMaps(updatedMaps)
    saveMapsToStorage(updatedMaps)
  }

  // 批量更新格子
  const updateCells = (cellKeys, updates) => {
    if (!currentMap) return

    const updatedCells = { ...currentMap.cells }
    cellKeys.forEach(key => {
      if (updatedCells[key]) {
        updatedCells[key] = { ...updatedCells[key], ...updates }
      }
    })

    const updatedMap = { ...currentMap, cells: updatedCells }
    setCurrentMap(updatedMap)

    const updatedMaps = maps.map(map =>
      map.id === currentMap.id ? updatedMap : map
    )
    setMaps(updatedMaps)
    saveMapsToStorage(updatedMaps)
  }

  // 处理格子点击
  const handleCellClick = (x, y, event) => {
    if (!currentMap) return

    // 拾色器模式优先处理
    if (isPickerMode) {
      pickCellData(x, y)
      return
    }

    switch (editMode) {
      case 'single':
        selectCell(x, y)
        break
      case 'paint':
        paintCell(x, y)
        break
      case 'select':
        toggleCellSelection(x, y, event?.ctrlKey)
        break
      case 'fill':
        fillArea(x, y)
        break
    }
  }

  // 拾取格子数据
  const pickCellData = (x, y) => {
    const key = `${x}_${y}`
    const cell = currentMap.cells[key]
    if (cell) {
      setCurrentBrushColor(cell.color)
      setDefaultInfo(cell.info || '') // 确保空字符串也能拾取
      setIsPickerMode(false) // 拾取后自动退出拾色器模式
    }
  }

  // 应用预设到画笔
  const applyPreset = (preset) => {
    setCurrentBrushColor(preset.color)
    setDefaultInfo(preset.info)
  }

  // 添加新预设
  const addPreset = (preset) => {
    if (!currentMap) return

    const newPreset = {
      id: Date.now().toString(),
      name: preset.name,
      color: preset.color,
      info: preset.info
    }

    const updatedMap = {
      ...currentMap,
      presets: [...currentMap.presets, newPreset]
    }

    setCurrentMap(updatedMap)
    updateMapInStorage(updatedMap)
  }

  // 删除预设
  const deletePreset = (presetId) => {
    if (!currentMap) return

    const updatedMap = {
      ...currentMap,
      presets: currentMap.presets.filter(p => p.id !== presetId)
    }

    setCurrentMap(updatedMap)
    updateMapInStorage(updatedMap)
  }

  // 更新存储中的地图
  const updateMapInStorage = (updatedMap) => {
    const updatedMaps = maps.map(map =>
      map.id === updatedMap.id ? updatedMap : map
    )
    setMaps(updatedMaps)
    saveMapsToStorage(updatedMaps)
  }

  // 选择单个格子
  const selectCell = (x, y) => {
    const key = `${x}_${y}`
    setSelectedCell(currentMap.cells[key])
    setSelectedCells(new Set())
  }

  // 绘画格子
  const paintCell = (x, y) => {
    const updates = {
      color: currentBrushColor,
      info: defaultInfo // 总是应用默认信息，包括空字符串
    }
    updateCell(x, y, updates)
  }

  // 切换格子选择状态
  const toggleCellSelection = (x, y, ctrlKey) => {
    const key = `${x}_${y}`
    const newSelection = new Set(selectedCells)

    if (!ctrlKey) {
      newSelection.clear()
    }

    if (newSelection.has(key)) {
      newSelection.delete(key)
    } else {
      newSelection.add(key)
    }

    setSelectedCells(newSelection)
    setSelectedCell(null)
  }

  // 矩形区域选择
  const selectRectangleArea = (startX, startY, endX, endY, addToSelection) => {
    if (!currentMap) return

    const minX = Math.min(startX, endX)
    const maxX = Math.max(startX, endX)
    const minY = Math.min(startY, endY)
    const maxY = Math.max(startY, endY)

    const newSelection = addToSelection ? new Set(selectedCells) : new Set()

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        if (x >= 0 && x < currentMap.width && y >= 0 && y < currentMap.height) {
          const key = `${x}_${y}`
          newSelection.add(key)
        }
      }
    }

    setSelectedCells(newSelection)
    setSelectedCell(null)
  }

  // 填充区域
  const fillArea = (x, y) => {
    const key = `${x}_${y}`
    const targetColor = currentMap.cells[key].color
    const fillColor = currentBrushColor

    if (targetColor === fillColor) return

    const visited = new Set()
    const queue = [{ x, y }]
    const cellsToUpdate = []

    while (queue.length > 0) {
      const { x: cx, y: cy } = queue.shift()
      const ckey = `${cx}_${cy}`

      if (visited.has(ckey)) continue
      if (cx < 0 || cx >= currentMap.width || cy < 0 || cy >= currentMap.height) continue
      if (currentMap.cells[ckey].color !== targetColor) continue

      visited.add(ckey)
      cellsToUpdate.push(ckey)

      queue.push({ x: cx + 1, y: cy })
      queue.push({ x: cx - 1, y: cy })
      queue.push({ x: cx, y: cy + 1 })
      queue.push({ x: cx, y: cy - 1 })
    }

    const updates = {
      color: fillColor,
      info: defaultInfo // 总是填充默认信息，包括空字符串
    }
    updateCells(cellsToUpdate, updates)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>地图创建器</h1>
        <div className="header-controls">
          <button onClick={() => setShowMapManager(true)}>
            地图管理
          </button>
          {currentMap && (
            <span className="current-map-name">
              当前地图: {currentMap.name}
            </span>
          )}
        </div>
      </header>

      <main className="app-main">
        {showMapManager && (
          <MapManager
            maps={maps}
            onCreateMap={createNewMap}
            onLoadMap={loadMap}
            onDeleteMap={deleteMap}
            onClose={() => setShowMapManager(false)}
          />
        )}



        {currentMap && !showMapManager && (
          <div className="map-workspace">
            {/* 预设面板 */}
            {showPresetPanel && (
              <div className="preset-panel">
                <PresetManager
                  presets={currentMap.presets || []}
                  onApplyPreset={applyPreset}
                  onAddPreset={addPreset}
                  onDeletePreset={deletePreset}
                  currentBrushColor={currentBrushColor}
                  defaultInfo={defaultInfo}
                  isPanel={true}
                />
              </div>
            )}

            <div className="map-container">
              <div className="toolbar">
                <div className="toolbar-section map-info-section">
                  <span className="map-info-text">
                    {currentMap.name} ({currentMap.width}×{currentMap.height}, {currentMap.cellSize}px)
                  </span>
                </div>
                <div className="toolbar-section">
                  <label>操作模式:</label>
                  <div className="mode-buttons">
                    <button
                      className={`mode-btn ${editMode === 'single' ? 'active' : ''}`}
                      onClick={() => changeEditMode('single')}
                    >
                      单格编辑
                    </button>
                    <button
                      className={`mode-btn ${editMode === 'paint' ? 'active' : ''}`}
                      onClick={() => changeEditMode('paint')}
                    >
                      绘画模式
                    </button>
                    <button
                      className={`mode-btn ${editMode === 'select' ? 'active' : ''}`}
                      onClick={() => changeEditMode('select')}
                    >
                      区域选择
                    </button>
                    <button
                      className={`mode-btn ${editMode === 'fill' ? 'active' : ''}`}
                      onClick={() => changeEditMode('fill')}
                    >
                      填充模式
                    </button>
                  </div>
                </div>
                <div className="toolbar-section">
                  <label>快速颜色:</label>
                  <div className="quick-colors">
                    {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#000000'].map(color => (
                      <div
                        key={color}
                        className={`quick-color ${currentBrushColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setCurrentBrushColor(color)}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
                <div className="toolbar-section">
                  <button
                    className={`picker-btn ${isPickerMode ? 'active' : ''}`}
                    onClick={() => setIsPickerMode(!isPickerMode)}
                    title="拾色器：点击地图上的格子来拾取颜色和信息"
                  >
                    {isPickerMode ? '退出拾色器' : '拾色器'}
                  </button>
                  <button
                    className={`preset-panel-btn ${showPresetPanel ? 'active' : ''}`}
                    onClick={() => setShowPresetPanel(!showPresetPanel)}
                    title="显示/隐藏地块预设面板"
                  >
                    {showPresetPanel ? '隐藏预设' : '地块预设'}
                  </button>
                </div>
                <div className="toolbar-section">
                  <button onClick={() => setSelectedCells(new Set())}>清除选择</button>
                  <button onClick={() => {
                    const allKeys = new Set()
                    for (let x = 0; x < currentMap.width; x++) {
                      for (let y = 0; y < currentMap.height; y++) {
                        allKeys.add(`${x}_${y}`)
                      }
                    }
                    setSelectedCells(allKeys)
                  }}>全选</button>
                </div>
                <div className="toolbar-section">
                  <label>显示选项:</label>
                  <div className="display-options">
                    <button
                      className={`display-option-btn ${showCoordinates ? 'active' : ''}`}
                      onClick={() => setShowCoordinates(!showCoordinates)}
                      title="显示/隐藏坐标"
                    >
                      坐标
                    </button>
                    <button
                      className={`display-option-btn ${showInfo ? 'active' : ''}`}
                      onClick={() => setShowInfo(!showInfo)}
                      title="显示/隐藏信息"
                    >
                      信息
                    </button>
                  </div>
                </div>
                {editMode === 'select' && selectedCells.size > 0 && (
                  <div className="toolbar-section">
                    <label>批量操作:</label>
                    <button onClick={() => updateCells(Array.from(selectedCells), { color: currentBrushColor })}>
                      应用颜色
                    </button>
                    <input
                      type="text"
                      placeholder="批量信息"
                      style={{ width: '120px' }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          updateCells(Array.from(selectedCells), { info: e.target.value })
                          e.target.value = ''
                        }
                      }}
                    />
                  </div>
                )}
              </div>
              <MapGrid
                map={currentMap}
                editMode={editMode}
                isPickerMode={isPickerMode}
                onCellClick={handleCellClick}
                onRectangleSelect={selectRectangleArea}
                selectedCell={selectedCell}
                selectedCells={selectedCells}
                showCoordinates={showCoordinates}
                showInfo={showInfo}
              />
            </div>

            <div className="editor-container">
              <SettingsPanel
                editMode={editMode}
                currentBrushColor={currentBrushColor}
                onBrushColorChange={setCurrentBrushColor}
                defaultInfo={defaultInfo}
                onDefaultInfoChange={setDefaultInfo}
                selectedCell={selectedCell}
                selectedCells={selectedCells}
                onCellUpdate={(updates, x, y) => {
                  if (x !== undefined && y !== undefined) {
                    updateCell(x, y, updates)
                  } else if (selectedCell) {
                    updateCell(selectedCell.x, selectedCell.y, updates)
                  }
                }}
                onBatchUpdate={updateCells}
                onCloseCellEditor={() => setSelectedCell(null)}
              />
            </div>
          </div>
        )}

        {!currentMap && !showMapManager && (
          <div className="welcome-screen">
            <h2>欢迎使用地图创建器</h2>
            <p>点击"地图管理"开始创建或加载地图</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
