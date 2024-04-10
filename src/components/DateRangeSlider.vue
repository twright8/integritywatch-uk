<template>
  <div class="date-range-slider">
    <input type="date" v-model="startDate" @change="updateSliderValues" />
    <vue-slider v-model="sliderValue" :min="min" :max="max" @drag-end="syncDatePickers" :process-style="{ backgroundColor: '#ddd' }" />
    <input type="date" v-model="endDate" @change="updateSliderValues" />
  </div>
</template>

<script>
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

export default {
  components: {
    VueSlider,
  },
  data() {
    const today = new Date()
    const startOfYear = new Date(today.getFullYear(), 0, 1)
    const endOfYear = new Date(today.getFullYear(), 11, 31)
    return {
      startDate: this.formatDate(today), // Today as default
      endDate: this.formatDate(today), // Today as default
      sliderValue: [this.dateToSlider(today), this.dateToSlider(today)],
      min: this.dateToSlider(startOfYear), // Minimum slider value set to start of current year
      max: this.dateToSlider(endOfYear), // Maximum slider value set to end of current year
    }
  },
  methods: {
    formatDate(date) {
      return date.toISOString().split('T')[0]
    },
    updateSliderValues() {
      this.sliderValue = [this.dateToSlider(new Date(this.startDate)), this.dateToSlider(new Date(this.endDate))];
    },
    syncDatePickers() {
      const [startSliderVal, endSliderVal] = this.sliderValue;
      this.startDate = this.formatDate(this.sliderToDate(startSliderVal));
      this.endDate = this.formatDate(this.sliderToDate(endSliderVal));
    },
    dateToSlider(date) {
      // Convert a date to a slider value
      const startOfYear = new Date(date.getFullYear(), 0, 1);
      return Math.floor((date - startOfYear) / (1000 * 60 * 60 * 24));
    },
    sliderToDate(sliderVal) {
      // Convert a slider value back to a date
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      return new Date(startOfYear.setDate(startOfYear.getDate() + sliderVal));
    },
  },
}
</script>

<style scoped>
.date-range-slider {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
