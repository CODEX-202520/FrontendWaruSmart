<script>

import {CropsRecomendationApiService} from "../services/crops-recomendation-api.service.js";

const defaultStyle = { width: '450px'};

export default {
  name: "sowing-item-create-and-edit-dialog",
  props: { entity: null, visible: Boolean, entityName: '', edit: Boolean, size: 'default' },
  data () {
    return {
      cropsService: null,
      cropList : [],
      phenologicalPhases: [
        { name: 'Germinación', value: 'Germination' },
        { name: 'Macollaje', value: 'Tillering' },
        { name: 'Elongación del tallo', value: 'StemElongation' },
        { name: 'Embuchamiento', value: 'Booting' },
        { name: 'Espigamiento', value: 'Heading' },
        { name: 'Floración', value: 'Flowering' },
        { name: 'Llenado de grano', value: 'GrainFilling' },
        { name: 'Maduración', value: 'Ripening' },
        { name: 'Listo para cosechar', value: 'HarvestReady' }
      ]
    }
  },

  methods: {
    onSave() {
      // Preparar el objeto para enviar
      const entityToSave = {
        ...this.entity,
        // Si no se seleccionó una fase fenológica, se enviará como null y el backend usará la default
        phenologicalPhase: this.entity.phenological_phase || null
      };
      this.$emit('saved', entityToSave);
    },
    onCancel() {
      this.$emit('canceled');
    },
    getHeaderTitle() {
      return `${this.edit ? 'Edit' : 'New'} ${this.entityName}`;
    },
    getSubmitLabel() {
      return this.edit ? 'Update' : 'Create';
    },
    getDialogStyle() {
      let dialogStyle = defaultStyle;
      dialogStyle = this.size === 'standard' ? { width: '600px'} : defaultStyle;
      dialogStyle = this.size === 'large' ? { width: '900px'} : defaultStyle;
      return dialogStyle;
    }
  }
  ,
  async created(){
    this.cropsService = new CropsRecomendationApiService();
    const response =  await this.cropsService.getAllCrops();
    this.cropList = response.data.map(crop => ({ name: crop.name, id: crop.id }));
    console.log(this.cropList);
    console.log('Created');
  }
}
</script>

<template>
  <pv-dialog v-bind:visible="visible" :modal="true" :style="getDialogStyle()" class="p-fluid" :header="entityName">
    <template #header>
      <div class="flex justify-content-start">
        <div>{{ getHeaderTitle() }}</div>
      </div>
    </template>
    <div class="p-fluid">
      <div class="field mt-5">
        <pv-float-label>
          <label for="crop_name">{{$t('cropName')}}</label>
          <pv-dropdown id="crop_name" v-model="entity.crop_name" :options="cropList" :class="{'p-invalid':!entity.crop_name}" optionLabel="name"/>
          <small v-if="!entity.crop_name" class="p-invalid">{{$t('cropNameRequired')}}</small>
        </pv-float-label>
      </div>
      <div class="p-field mt-5">
        <pv-float-label>
          <label for="area_land">{{$t('areaLand')}}</label>
          <input id="area_land" v-model="entity.area_land" class="p-inputtext p-component" type="number"/>
        </pv-float-label>
      </div>
      <div class="field mt-5">
        <pv-float-label>
          <label for="phenological_phase">{{$t('phenologicalPhase')}}</label>
          <pv-dropdown 
            id="phenological_phase" 
            v-model="entity.phenological_phase" 
            :options="phenologicalPhases" 
            optionLabel="name" 
            optionValue="value"
            :placeholder="$t('selectPhenologicalPhase')"
          />
        </pv-float-label>
      </div>
    </div>
    <template #footer>
      <div class="flex justify-content-end">
        <pv-button type="button" :label="getSubmitLabel()" class="p-button-text button-green" icon="pi pi-check" @click="onSave"/>
        <pv-button type="button" label="Cancel" severity="secondary" class="p-button-text button-brown" icon="pi pi-times" @click="onCancel"/>
      </div>
    </template>
  </pv-dialog>


</template>




<style scoped>

</style>