<script>
import { SowingsApiService } from "../services/sowings-api.service.js";
import { CropsRecomendationApiService } from "../services/crops-recomendation-api.service.js";
import { Sowing } from "../models/sowing.entity.js";
import SowingItemCreateAndEditDialog from "../components/sowing-item-create-and-edit-dialog.component.vue";
import ChangePhaseDialog from "../components/change-phase-dialog.component.vue";
import { FilterMatchMode } from "primevue/api";

export default {
  name: "crop-list-and-registration-management",
  components: { SowingItemCreateAndEditDialog, ChangePhaseDialog },

  data() {
    return {
      sowings: [],
      sowing: {},
      selectedSowing: {},
      filters: {},
      cropsService: null,
      sowingService: null,
      createAndEditDialogIsVisible: false,
      changePhaseDialogVisible: false,
      isEdit: false,
      submitted: false,
      selectedSowingId: null,
      crops: [],
      historyService: null,
      originalSowings: []
    }
  },
  methods: {
    filterByCrop(cropId) {
      if (!this.originalSowings || this.originalSowings.length === 0) {
        console.warn("There is no data in original. Sowings to filter..");
        return;
      }
      // Filtra los sowings asociados al crop_id
      this.sowings = this.originalSowings.filter((sowing) => sowing.crop_id === cropId);
    },

    reloadData() {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("No userId found in localStorage");
        return;
      }

      this.sowingService
        .getByUserId(userId)
        .then((response) => {
          const sowings = response.data;
          return Promise.all(
            sowings.map((sowing) => Sowing.toDisplayableSowing(sowing))
          );
        })
        .then((processedSowings) => {
          this.sowings = processedSowings;
          this.originalSowings = [...processedSowings]; // Guarda los datos originales
        })
        .catch((error) => {
          console.error("Error loading user plantings:", error);
        });
    },

    initFilters() {
      this.filters = { global: { value: null, matchMode: FilterMatchMode.CONTAINS } };
    },
    findIndexById(id) {
      return this.sowings.findIndex((sowing) => sowing.id === id);
    },

    onNewItemEventHandler() {
      this.sowing = {};
      this.submitted = false;
      this.isEdit = false;
      this.createAndEditDialogIsVisible = true;
    },
    onEditItemEventHandler(item) {
      this.sowing = item;
      this.submitted = false;
      this.isEdit = true;
      this.createAndEditDialogIsVisible = true;
    },

    onDeleteItemEventHandler(item) {
      this.sowing = item;
      this.deleteSowing();
    },

    onCanceledEventHandler() {
      this.createAndEditDialogIsVisible = false;
      this.submitted = false;
      this.isEdit = false;
    },

    onSavedEventHandler(item) {
      console.log(item);
      this.submitted = true;
      if (this.sowing.crop_name.name.trim()) {
        if (this.sowing.area_land <= 0) {
          this.sowing.area_land = 50;
        }
        console.log('item');
        console.log(item.id);
        if (item.id && typeof item.id === 'number') {
          this.updateSowing();
        } else {
          this.createSowing();
        }
      }
      this.createAndEditDialogIsVisible = false;
      this.isEdit = false;
    },
    viewSowing(rowData) {
      if (!rowData.crop_id || !rowData.id) {
        console.error("The required parameters cropId or sowingId are missing");
        return;
      }
      this.$router.push({
        name: 'crop-information',
        params: {
          cropId: rowData.crop_id,
          sowingId: rowData.id,
        },
      });
    },
    createSowing() {
      this.sowing.id = "";

      let currentDate = new Date();
      this.sowing.start_date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()).toISOString().split('T')[0];

      let harvestDate = new Date(currentDate.setMonth(currentDate.getMonth() + 4));
      this.sowing.harvest_date = new Date(harvestDate.getFullYear(), harvestDate.getMonth(), harvestDate.getDate()).toISOString().split('T')[0];

      // Obtén el userId del localStorage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('No userId found in localStorage');
        return;
      }

      this.sowing.user_id = userId;
      this.sowing.crop_id = this.sowing.crop_name.id;
      this.sowing.crop_name = this.sowing.crop_name.name;

      this.sowing = Sowing.fromDisplayableSowing(this.sowing);
      let sowingResource = {
        areaLand: this.sowing.area_land,
        cropId: this.sowing.crop_id,
        userId: parseInt(userId)
      };

      console.log(sowingResource);
      this.sowingService.create(sowingResource)
        .then((response) => {
          this.sowing = Sowing.toDisplayableSowing(response.data);
          this.sowings.push(this.sowing);
          this.reloadData();
        })
        .catch((error) => {
          console.error('Error creating seed:', error);
        });
    },

    changePhenologicalPhase(sowing) {
      console.log('Cambiando fase fenológica para el sowing:', sowing);
      console.log('ID del sowing:', sowing.id);
      console.log('Crop name:', sowing.crop_name);
      console.log('Fase fenológica actual:', sowing.phenological_phase);

      this.sowing = { ...sowing }; // Hacer una copia para asegurar reactividad
      console.log('Sowing asignado:', this.sowing);
      console.log('Fase fenológica en this.sowing:', this.sowing.phenological_phase);
      
      this.changePhaseDialogVisible = true;
    },

    onPhaseChangeConfirmed(auditData) {
      const phaseValues = {
        'Germination': 0,
        'Tillering': 1,
        'Stem Elongation': 2,
        'Booting': 3,
        'Heading': 4,
        'Flowering': 5,
        'Grain Filling': 6,
        'Ripening': 7,
        'Harvest Ready': 8
      };

      const phaseNames = ['Germination', 'Tillering', 'Stem Elongation', 'Booting', 'Heading', 'Flowering', 'Grain Filling', 'Ripening', 'Harvest Ready'];
      let phaseValue = phaseValues[this.sowing.phenological_phase];

      if (phaseValue < 8) {
        phaseValue++;
      }
      this.sowing.phenological_phase = phaseNames[phaseValue];
      
      // Crear registro de auditoría
      const auditTrailData = {
        ...auditData,
        sowingId: this.sowing.id,
        phenologicalPhase: phaseNames[phaseValue]
      };

      // Actualizar el sowing en la base de datos
      this.sowingService.updatePhenologicalPhase(this.sowing.id)
        .then(() => {
          console.log('Sowing updated');
          this.reloadData();
        })
        .catch((error) => {
          console.error('Error updating sowing:', error);
        });

      this.changePhaseDialogVisible = false;
      if (this.sowing.phenological_phase === 'HarvestReady') {
        this.historyService.addToHistory(this.sowing)
          .then(() => {
            console.log('Sowing added to history');
          })
          .catch((error) => {
            console.error('Error adding sowing to history:', error);
          });
      }
    },
    onPhaseChangeCanceled() {
      this.changePhaseDialogVisible = false;
    },

    updateSowing() {
      // Convert the seeded object to the appropriate format
      this.sowing = Sowing.fromDisplayableSowing(this.sowing);

      // Create the update object
      const updateResource = {
        areaLand: this.sowing.area_land,
        cropId: this.sowing.crop_name.id
      };

      console.log('Send data:', updateResource);

      // Call the service to update the planting.
      this.sowingService
        .update(this.sowing.id, updateResource)
        .then((response) => {
          console.log('Response backend:', response.data);


          this.sowing = Sowing.toDisplayableSowing(response.data);


          this.reloadData();
        })
        .catch((error) => {
          console.error('Error updating seeding:', error);
        });
    },

    deleteSowing() {
      console.log('Deleting sowing with ID:', this.sowing.crop_name.id);

      this.sowingService.delete(this.sowing.id)
        .then(() => {
          this.reloadData();
          this.sowing = {};
        })
        .catch((error) => {
          console.error('Error deleting sowing:', error);
        });
    },
    loadCrops() {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("No userId found in localStorage");
        return;
      }
      // Obtén los sowings asociados al usuario
      this.sowingService.getByUserId(userId)
        .then((response) => {
          const sowings = response.data;
          console.log("Sowings obtained:", sowings);

          // Extrae los crop_ids únicos
          const cropIds = [...new Set(sowings.map((sowing) => sowing.crop_id || sowing.cropId))];
          console.log("Unique crop IDs before filtering:", cropIds);

          const validCropIds = cropIds.filter((id) => id !== undefined);
          console.log("Invalid crop identifiers:", validCropIds);

          // Obtén todos los crops y filtra solo los que tienen un sowing asociado
          return this.cropsService.getAllCrops()
            .then((response) => {
              this.crops = response.data.filter((crop) => validCropIds.includes(crop.id));
              console.log("Filtered crops:", this.crops); // Verifica los crops filtrados
            });
        })
        .catch((error) => {
          console.error("Error loading crops or sowings:", error);
        });
    },
  },

  created() {
    console.log('Created table');
    this.sowingService = new SowingsApiService();
    this.cropsService = new CropsRecomendationApiService();
    this.loadCrops();
    this.initFilters();
    this.reloadData();

    // Obtén el userId del localStorage
    const userId = localStorage.getItem('userId');

    if (userId) {
      // Llama al servicio para obtener los sowings del usuario
      this.sowingService.getByUserId(userId)
        .then((response) => {
          console.log('Raw sowings data for user:', response.data); // Log raw data
          let sowings = response.data;
          return Promise.all(sowings.map((sowing) => Sowing.toDisplayableSowing(sowing)));
        })
        .then((processedSowings) => {
          this.sowings = processedSowings;
          console.log('Processed sowings data for user:', this.sowings); // Log processed data
        })
        .catch((error) => {
          console.error('Error fetching data for user:', error);
        });
    } else {
      console.error('No userId found in localStorage');
    }

    this.initFilters();
  },

}
</script>


<template>
  <div class="section-container">

    <h1 class="section-title">
      {{ $t('listCrops') }}
      <i class="pi pi-history icon-large" style="font-size: 2.5rem; margin-left: 0.5rem;"></i>
    </h1>

    <div class="crop-filter-container">
      <pv-button v-for="crop in crops" :key="crop.id" :label="crop.name" class="p-button-outlined crop-filter-btn"
        @click="filterByCrop(crop.id)" />
    </div>
    <div>
      <!-- Tabla de datos -->
      <pv-data-table ref="dt" :value="sowings" v-model:selection="selectedSowing" dataKey="id" selectionMode="single"
        :paginator="true" :rows="5" :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products">
        <template #header>
          <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
            <pv-icon-field iconPosition="left">
              <pv-input-icon>
                <i class="pi pi-search" />
              </pv-input-icon>
              <pv-input-text v-model="filters['global'].value" :placeholder="$t('search')" />
            </pv-icon-field>
            <pv-button :label="$t('addSowing')" icon="pi pi-plus" severity="success" class="mr-2 button-brown"
              @click="onNewItemEventHandler" />
          </div>
        </template>
        <pv-column field="crop_name" :header="$t('cropName')" style="min-width:8rem"></pv-column>
        <pv-column field="start_date" :header="$t('plantedDate')" style="min-width:15rem"></pv-column>
        <pv-column field="harvest_date" :header="$t('harvestDate')" style="min-width:15rem"></pv-column>
        <pv-column field="phenological_phase" :header="$t('phenologicalPhase')" style="min-width:12rem">
        </pv-column>
        <pv-column :header="$t('actions')" :exportable="false" style="min-width:8rem">
          <template #body="slotProps">
            <pv-button icon="pi pi-exclamation-triangle" outlined rounded class="mr-2"
              @click="changePhenologicalPhase(slotProps.data)" />
            <pv-button icon="pi pi-pencil" outlined rounded class="mr-2"
              @click="onEditItemEventHandler(slotProps.data)" />
            <pv-button icon="pi pi-trash" outlined rounded severity="danger"
              @click="onDeleteItemEventHandler(slotProps.data)" />
            <pv-button icon="pi pi-eye" outlined rounded class="mr-2" @click="viewSowing(slotProps.data)" />
          </template>
        </pv-column>
      </pv-data-table>
    </div>
  </div>

    <change-phase-dialog 
    :visible.sync="changePhaseDialogVisible" 
    :sowing-id="sowing.id"
    :current-phase="sowing.phenological_phase"
    :is-harvest-ready="sowing.phenological_phase === 'Harvest Ready'"
    @canceled="onPhaseChangeCanceled"
    @confirmed="onPhaseChangeConfirmed" />  <sowing-item-create-and-edit-dialog :entity="sowing" :visible="createAndEditDialogIsVisible" entityName="Sowing"
    :edit="isEdit" v-on:canceled="onCanceledEventHandler" v-on:saved="onSavedEventHandler($event)" />
</template>

<style scoped>
.position {
  padding-top: 4rem;
}

.p-datatable .p-datatable-tbody>tr:hover {
  background-color: #d1e8ff;
}

.p-datatable .p-datatable-thead>tr>th {
  background-color: #007bff;
  color: #ffffff;
}

h2 {
  margin-top: 100px;
  color: black;
}

.crop-filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 1rem 1rem 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 8px;
  background-color: #f5f7f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.crop-filter-btn {
  background-color: #ffffff;
  border-color: #e0e0e0;
  color: #445566;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-weight: 500;
  padding: 0.5rem 1rem;
}

.crop-filter-btn:hover {
  background-color: #f0f4f9;
  border-color: #c0c8d0;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  color: #2c3e50;
}

.crop-filter-btn:focus {
  box-shadow: 0 0 0 2px rgba(70, 120, 190, 0.2);
  border-color: #6c90c0;
}

.crop-filter-btn.p-button.p-component.p-highlight {
  background-color: #edf5ff;
  border-color: #4d7fc0;
  color: #2c5282;
}
.section-title h2 {
  font-size: 2rem;
  color: #333;
  margin: 0.5rem 0;
  padding: 0 0.5rem;
}
</style>