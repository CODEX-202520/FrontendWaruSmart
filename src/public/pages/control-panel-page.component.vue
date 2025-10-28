<script>
import {CropsRecomendationApiService} from "../../crops/services/crops-recomendation-api.service.js";

export default {
  name: "control-panel-page",
  data() {
    return {
      items: [
        { label: 'Statistical Reports', to: '/sowing-statistics-reports' },
        { label: 'Crop Registration', to: '/crop-list/registration' },
      ],
      recommendedCrop: null
    }
  },
  created() {
    const cropsRecomendationService = new CropsRecomendationApiService();
    cropsRecomendationService.getAllCrops().then(response => {
      const crops = response.data;
      const randomIndex = Math.floor(Math.random() * crops.length);
      this.recommendedCrop = crops[randomIndex];
    });
  }
}
</script>

<template>
  <div class="section-container">
    <h1 class="section-title">{{ $t('controlPanel') }}</h1>
    <div class="main-container">
      <div class="left-container">
        <pv-card class="justify-content-center mt-2">
          <template #content>
            <i class="pi pi-clipboard icon-large"></i>
          </template>
          <template #footer>
            <router-link :to="items[1].to"  rel="noopener">
              <pv-button class="button-green" :label="items[1].label" />
            </router-link>
          </template>
        </pv-card>

        <pv-card class="justify-content-center mt-2">
          <template #content>
            <i class="pi pi-chart-bar icon-large"></i>
          </template>
          <template #footer>
            <router-link :to="items[0].to"  rel="noopener">
              <pv-button class="button-green" :label="items[0].label" />
            </router-link>
          </template>
        </pv-card>
      </div>

      <div class="right-container">
        <pv-card class="card-crop-control">
          <template #content>
            <h2>{{$t('seasonCropRecommendation')}}</h2>
            <h3>{{ recommendedCrop?.name }}</h3>
            <img :src="recommendedCrop?.imageUrl" alt="Crop image" class="fixed-size-image">
            <p>{{ recommendedCrop?.description }}</p>
          </template>
        </pv-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 200px); /* Ajustado para considerar el título y el toolbar */
  padding: 2rem;
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
    align-items: center;
    padding: 1rem;
  }
}

.left-container {
  display: flex;
  flex-direction: column; /* Asegura que las tarjetas estén en columna */
  align-items: center; /* Centra las tarjetas horizontalmente */
  gap: 1rem; /* Espaciado entre las tarjetas */
}

.left-container,
.right-container {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.icon-large {
  font-size: 8em;
  color: black;
  margin-bottom: 0.1em;
}

.button-green {
  background-color: #3E7C59;
  color: white;
}
.fixed-size-image {
  width: 300px;
  height: 300px;
  border-radius:25px;
}
.card-crop-control{
  background-color: #3E7C59;
  color: #ffffff;
  border-radius: 25px;
}
.pv-card {
  width: 300px; /* Ajusta el ancho de las tarjetas */
  height: 200px; /* Ajusta el alto de las tarjetas */
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* Espaciado entre contenido y pie */
  align-items: center;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Opcional: sombra para mejor apariencia */
}
</style>