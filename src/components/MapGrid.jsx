import React, { useState, useRef, useEffect } from 'react'
import './MapGrid.css'

const MapGrid = ({ map, editMode, isPickerMode, onCellClick, onRectangleSelect, selectedCell, selectedCells, showCoordinates, showInfo }) => {
  if (!map) return null

  const { width, height, cellSize, cells } = map
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [selectionStart, setSelectionStart] = useState(null)

  // 缩放和拖动状态
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef(null)

  const handleCellClick = (x, y, event) => {
    // 如果正在拖动，不触发格子点击
    if (isDragging) return
    onCellClick(x, y, event)
  }

  // 处理滚轮缩放
  const handleWheel = (event) => {
    event.preventDefault()
    const delta = event.deltaY > 0 ? -0.1 : 0.1
    const newScale = Math.max(0.2, Math.min(3, scale + delta))
    setScale(newScale)
  }

  // 处理拖动开始
  const handleDragStart = (event) => {
    if (event.button === 1 || (event.button === 0 && event.ctrlKey)) { // 中键或Ctrl+左键
      event.preventDefault()
      setIsDragging(true)
      setDragStart({
        x: event.clientX - position.x,
        y: event.clientY - position.y
      })
    }
  }

  // 处理拖动
  const handleDragMove = (event) => {
    if (isDragging) {
      event.preventDefault()
      setPosition({
        x: event.clientX - dragStart.x,
        y: event.clientY - dragStart.y
      })
    }
  }

  // 处理拖动结束
  const handleDragEnd = () => {
    setIsDragging(false)
  }

  // 重置视图
  const resetView = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  // 添加全局鼠标事件监听
  useEffect(() => {
    const handleGlobalMouseMove = (event) => handleDragMove(event)
    const handleGlobalMouseUp = () => handleDragEnd()

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDragging, dragStart])

  const handleMouseDown = (x, y, event) => {
    event.preventDefault()
    setIsMouseDown(true)

    if (editMode === 'select') {
      setSelectionStart({ x, y })
      if (!event.ctrlKey) {
        // Clear previous selection if not holding Ctrl
      }
      handleCellClick(x, y, event)
    } else if (editMode === 'paint') {
      handleCellClick(x, y, event)
    }
  }

  const handleMouseEnter = (x, y, event) => {
    if (editMode === 'paint' && isMouseDown) {
      handleCellClick(x, y, event)
    } else if (editMode === 'select' && isMouseDown && selectionStart) {
      // Handle rectangle selection
      selectRectangleArea(selectionStart.x, selectionStart.y, x, y, event.ctrlKey)
    }
  }

  const handleMouseUp = () => {
    setIsMouseDown(false)
    setSelectionStart(null)
  }

  const selectRectangleArea = (startX, startY, endX, endY, addToSelection) => {
    if (onRectangleSelect) {
      onRectangleSelect(startX, startY, endX, endY, addToSelection)
    }
  }

  const renderCell = (x, y) => {
    const key = `${x}_${y}`
    const cell = cells[key]
    const isSelected = selectedCell && selectedCell.x === x && selectedCell.y === y
    const isMultiSelected = selectedCells && selectedCells.has(key)

    let cellClass = 'map-cell'
    if (isSelected) cellClass += ' selected'
    if (isMultiSelected) cellClass += ' multi-selected'

    return (
      <div
        key={key}
        className={cellClass}
        style={{
          width: cellSize,
          height: cellSize,
          backgroundColor: cell.color,
          color: getContrastColor(cell.color)
        }}
        onClick={(e) => handleCellClick(x, y, e)}
        onMouseDown={(e) => handleMouseDown(x, y, e)}
        onMouseEnter={(e) => handleMouseEnter(x, y, e)}
        onMouseUp={handleMouseUp}
        title={`坐标: (${x}_${y})\n颜色: ${cell.color}\n信息: ${cell.info || '无'}`}
      >
        {showCoordinates && (
          <div className="cell-coordinate">
            {x}_{y}
          </div>
        )}
        {showInfo && cell.info && (
          <div className="cell-info">
            {cell.info}
          </div>
        )}
      </div>
    )
  }

  const renderGrid = () => {
    const rows = []
    for (let y = 0; y < height; y++) {
      const cells = []
      for (let x = 0; x < width; x++) {
        cells.push(renderCell(x, y))
      }
      rows.push(
        <div key={y} className="map-row">
          {cells}
        </div>
      )
    }
    return rows
  }

  return (
    <div className="map-grid">
      {/* 缩放控制工具栏 */}
      <div className="zoom-controls">
        <button onClick={() => setScale(Math.min(3, scale + 0.2))}>放大 (+)</button>
        <span className="zoom-level">{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale(Math.max(0.2, scale - 0.2))}>缩小 (-)</button>
        <button onClick={resetView}>重置视图</button>
        <span className="zoom-hint">提示: 滚轮缩放, Ctrl+拖拽移动</span>
      </div>

      {/* 地图容器 */}
      <div
        className="grid-container"
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleDragStart}
        style={{
          cursor: isDragging ? 'grabbing' : (isPickerMode ? 'crosshair' : 'grab')
        }}
      >
        <div
          className="grid-content"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          {renderGrid()}
        </div>
      </div>
    </div>
  )
}

// 根据背景色计算对比色
const getContrastColor = (hexColor) => {
  // 移除#号
  const hex = hexColor.replace('#', '')

  // 转换为RGB
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  // 计算亮度
  const brightness = (r * 299 + g * 587 + b * 114) / 1000

  // 返回对比色
  return brightness > 128 ? '#000000' : '#ffffff'
}

export default MapGrid
