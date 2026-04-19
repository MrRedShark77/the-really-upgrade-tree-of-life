<script setup lang="ts">
import { state } from '@/main'
import { formatMult } from '@/utils/formats'
import { ref, computed, onUnmounted, type StyleValue } from 'vue'

const x = ref(10)
const y = ref(10)
const isDragging = ref(false)
const isCollapsed = ref(false)
const dragOffset = ref({ x: 0, y: 0 })

const windowStyle = computed(() => ({
  left: `${x.value}px`,
  top: `${y.value}px`,
  position: 'fixed',
  zIndex: 500
}))

const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  dragOffset.value = {
    x: e.clientX - x.value,
    y: e.clientY - y.value
  }

  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
  e.preventDefault()
}

const onDrag = (e: MouseEvent) => {
  x.value = e.clientX - dragOffset.value.x
  y.value = e.clientY - dragOffset.value.y
}

const stopDrag = () => {
  isDragging.value = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
}

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const changeSpeed = (e: Event) => {
  state.dev_speed = (e.target as HTMLInputElement).valueAsNumber
}

onUnmounted(stopDrag)
</script>

<template>
  <div
    class="draggable-window"
    :class="{ dragging: isDragging }"
    :style="windowStyle as StyleValue"
  >
    <!-- Header / Drag Handle -->
    <div class="window-header" @mousedown.stop="startDrag">
      <span class="window-title">Develop Window</span>
      <button
        class="toggle-btn"
        @click.stop="toggleCollapse"
        :aria-label="isCollapsed ? 'Expand content' : 'Collapse content'"
      >
        {{ isCollapsed ? '▲' : '▼' }}
      </button>
    </div>

    <!-- Content -->
    <div class="window-content" :class="{ collapsed: isCollapsed }">
      Game Speed: {{ formatMult(10**state.dev_speed) }}
      <input class="dev-input" type="range" :value="state.dev_speed" min="-2.0" max="2.0" step=".1" @input="changeSpeed">
    </div>
  </div>
</template>

<style scoped>
.draggable-window {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  user-select: none;
  color: #f1f5f9;
  width: 340px;
}

.draggable-window.dragging {
  cursor: grabbing;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.65);
}

.window-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #0f172a;
  border-bottom: 1px solid #334155;
  cursor: grab;
}

.window-header:active {
  cursor: grabbing;
}

.window-title {
  font-weight: 600;
  color: #e2e8f0;
  font-size: 14px;
  letter-spacing: 0.3px;
}

.toggle-btn {
  background: transparent;
  border: 1px solid #475569;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 12px;
  color: #94a3b8;
  border-radius: 6px;
  transition: all 0.2s ease;
  line-height: 1;
}

.toggle-btn:hover {
  background: #334155;
  color: #f8fafc;
  border-color: #64748b;
}

.window-content {
  padding: 5px 10px;
  overflow: hidden auto;
  max-height: 600px;
  opacity: 1;
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              padding 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.2s ease;
}

.window-content.collapsed {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
}

/* Dark Scrollbar */
.window-content::-webkit-scrollbar {
  width: 6px;
}
.window-content::-webkit-scrollbar-track {
  background: #0f172a;
}
.window-content::-webkit-scrollbar-thumb {
  background: #475569;
  border-radius: 3px;
}

.dev-input {
  width: 100%;
}
</style>
