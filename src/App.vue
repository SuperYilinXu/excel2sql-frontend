<script setup lang="ts">
import { useExcel2SqlStore } from '@/stores/excel2sql'
import StepProgress from '@/components/StepProgress.vue'
import Step1Upload from '@/components/Step1Upload.vue'
import Step2Schema from '@/components/Step2Schema.vue'
import Step3CreateTask from '@/components/Step3CreateTask.vue'
import Step4Mapping from '@/components/Step4Mapping.vue'
import Step5Generate from '@/components/Step5Generate.vue'

const store = useExcel2SqlStore()
</script>

<template>
  <div class="app-wrapper">
    <header class="navbar">
      <div class="navbar-inner">
        <div class="logo">
          <span class="logo-mark">⚡</span>
          <span class="logo-name">Excel<em>2</em>SQL</span>
        </div>
      </div>
    </header>

    <main class="main-content">
      <div class="container">
        <StepProgress :current="store.currentStep" />
        <div class="step-body">
          <Step1Upload v-if="store.currentStep === 1" />
          <Step2Schema v-else-if="store.currentStep === 2" />
          <Step3CreateTask v-else-if="store.currentStep === 3" />
          <Step4Mapping v-else-if="store.currentStep === 4" />
          <Step5Generate v-else-if="store.currentStep === 5" />
        </div>
      </div>
    </main>
  </div>
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
}

body {
  background: linear-gradient(150deg, #f5f8ff 0%, #ebf2fa 100%);
  min-height: 100vh;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    'PingFang SC',
    'Hiragino Sans GB',
    sans-serif;
  color: #333;
  -webkit-font-smoothing: antialiased;
}

/* Shared card style used by all step components */
.step-card {
  background: #fff;
  border-radius: 12px;
  padding: 36px 40px;
  box-shadow: 0 2px 16px rgba(74, 144, 217, 0.07);
}

.step-header {
  margin-bottom: 28px;
}

.step-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a2233;
  letter-spacing: -0.2px;
  margin-bottom: 6px;
}

.step-desc {
  font-size: 13px;
  color: #999;
}

.step-footer {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Upload zone shared */
.upload-zone {
  border: 2px dashed #c8d8ec;
  border-radius: 10px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  user-select: none;
  background: #fafcff;
}

.upload-zone:hover,
.upload-zone.is-dragover {
  border-color: #4a90d9;
  background: #f0f6ff;
}

.upload-zone.is-done {
  border-color: #52c41a;
  background: #f6ffed;
}

.upload-zone.is-disabled {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}

.hidden-input {
  display: none;
}

.upload-icon {
  font-size: 36px;
  margin-bottom: 12px;
  line-height: 1;
}

.upload-main {
  font-size: 15px;
  color: #555;
  margin-bottom: 6px;
}

.upload-main em {
  font-style: normal;
  color: #4a90d9;
  font-weight: 500;
}

.upload-sub {
  font-size: 12px;
  color: #bbb;
}

/* Result info card */
.result-card {
  margin-top: 20px;
  background: #f8fbff;
  border: 1px solid #e0ecf8;
  border-radius: 10px;
  padding: 20px 24px;
}

.result-meta {
  display: flex;
  gap: 40px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 11px;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.meta-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.meta-value.highlight {
  color: #4a90d9;
}

.col-headers-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
}

.headers-label {
  font-size: 13px;
  color: #777;
  white-space: nowrap;
  padding-top: 2px;
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.col-tag {
  background: #eaf3fd !important;
  border-color: #b8d6f0 !important;
  color: #4a90d9 !important;
  border-radius: 6px !important;
}

/* Next button */
.next-btn {
  min-width: 180px;
}

/* Transitions */
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

<style scoped>
.app-wrapper {
  min-height: 100vh;
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid #e8eef6;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(74, 144, 217, 0.06);
}

.navbar-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-mark {
  font-size: 22px;
}

.logo-name {
  font-size: 18px;
  font-weight: 700;
  color: #1a2233;
  letter-spacing: -0.3px;
}

.logo-name em {
  font-style: normal;
  color: #4a90d9;
}

.main-content {
  padding-top: 80px;
  padding-bottom: 64px;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}

.step-body {
  margin-top: 24px;
}
</style>
