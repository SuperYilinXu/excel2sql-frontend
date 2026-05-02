<script setup lang="ts">
defineProps<{ current: number }>()

const steps = [
  { n: 1, label: '上传 Excel' },
  { n: 2, label: '上传表结构' },
  { n: 3, label: '创建任务' },
  { n: 4, label: '字段映射' },
  { n: 5, label: '生成 SQL' },
]
</script>

<template>
  <div class="progress-wrap">
    <template v-for="(step, idx) in steps" :key="step.n">
      <div
        class="step-item"
        :class="{
          'is-done': current > step.n,
          'is-active': current === step.n,
          'is-pending': current < step.n,
        }"
      >
        <div class="step-circle">
          <el-icon v-if="current > step.n" :size="13"><Check /></el-icon>
          <span v-else>{{ step.n }}</span>
        </div>
        <span class="step-label">{{ step.label }}</span>
      </div>
      <div
        v-if="idx < steps.length - 1"
        class="step-line"
        :class="{ 'is-done': current > step.n }"
      />
    </template>
  </div>
</template>

<style scoped>
.progress-wrap {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  padding: 18px 32px;
  box-shadow: 0 2px 12px rgba(74, 144, 217, 0.07);
}

.step-item {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  transition:
    background 0.25s,
    box-shadow 0.25s;
}

.is-done .step-circle {
  background: #4a90d9;
  color: #fff;
}

.is-active .step-circle {
  background: #4a90d9;
  color: #fff;
  box-shadow: 0 0 0 4px rgba(74, 144, 217, 0.18);
}

.is-pending .step-circle {
  background: #f0f4f8;
  color: #b0bec8;
}

.step-label {
  font-size: 13px;
  transition: color 0.2s;
}

.is-done .step-label {
  color: #4a90d9;
}

.is-active .step-label {
  color: #1a2233;
  font-weight: 600;
}

.is-pending .step-label {
  color: #b0bec8;
}

.step-line {
  flex: 1;
  height: 2px;
  background: #e8eef6;
  margin: 0 14px;
  border-radius: 1px;
  transition: background 0.3s;
}

.step-line.is-done {
  background: #4a90d9;
}
</style>
