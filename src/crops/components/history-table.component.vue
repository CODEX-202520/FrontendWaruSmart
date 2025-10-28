<script>
      import { SowingsApiService } from "../services/sowings-api.service.js";
      import { CropsRecomendationApiService } from "../services/crops-recomendation-api.service.js";
      import { Sowing } from "../models/sowing.entity.js";
      import { FilterMatchMode } from "primevue/api";

      export default {
        name: 'crop-history',
        data() {
          return {
            sowings: [],
            selectedSowing: null,
            selectedSowingDetailsVisible: false,
            filters: {},
            sowingService: null,
            crop: null,
            rows: [],
            isUnmounted: false,
          };
        },
        methods: {
          initFilters() {
            this.filters = { global: { value: null, matchMode: FilterMatchMode.CONTAINS } };
          },
          async showSowingDetails(sowing) {
            console.log("Sowing data received:", sowing); // Depuración

            if (!sowing || !sowing.cropId) {
              console.error("Invalid sowing or cropId is undefined:", sowing);
              alert("The selected sowing does not have a valid cropId. Please check the data.");
              return;
            }

            this.selectedSowing = sowing;
            this.selectedSowingDetailsVisible = true;

            try {
              const cropApiService = new CropsRecomendationApiService();
              const cropResponse = await cropApiService.getCropById(sowing.cropId);
              this.crop = cropResponse.data;

              this.rows = [
                ["Planted Area (m²)", sowing.areaLand],
                ["Phenological Phase", sowing.phenologicalPhaseName],
              ];
            } catch (error) {
              console.error("Error fetching crop or sowing details:", error);
            }
          },
async loadSowings() {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    console.error("No userId found in localStorage");
    return;
  }

  try {
    const response = await this.sowingService.getByUserId(userId);
    let data;

    if (typeof response.data === 'string') {
      try {
        data = JSON.parse(response.data);
      } catch (error) {
        console.error('Error parsing response.data:', error);
        return;
      }
    } else if (typeof response.data === 'object') {
      data = response.data;
    } else {
      console.error('Unexpected type of response.data:', typeof response.data);
      return;
    }

    if (Array.isArray(data)) {
      const sowings = data;
      const displayableSowings = await Promise.all(
        sowings.map(async (sowing) => {
          // Obtén el nombre del cultivo desde el servicio
          let cropName = "Unknown Crop";
          if (sowing.cropId) {
            try {
              const cropApiService = new CropsRecomendationApiService();
              const cropResponse = await cropApiService.getCropById(sowing.cropId);
              cropName = cropResponse.data.name || cropName;
            } catch (error) {
              console.error(`Error fetching crop name for cropId ${sowing.cropId}:`, error);
            }
          }

          // Mapea los datos para la tabla
          const startDate = sowing.startDate ? sowing.startDate.split("T")[0] : "N/A";
          const harvestDate = sowing.endDate ? sowing.endDate.split("T")[0] : "N/A";

          return {
            ...sowing,
            crop_name: cropName,
            start_date: startDate,
            harvest_date: harvestDate,
          };
        })
      );
      this.sowings = displayableSowings;
      console.log('Sowings for user:', this.sowings);
    } else {
      console.error('Error: data is not an array');
    }
  } catch (error) {
    console.error('Error loading sowings for user:', error);
  }
},
          closeDialog() {
            this.selectedSowingDetailsVisible = false;
            this.selectedSowing = null;
            this.crop = null;
            this.rows = [];
          },
        },
        created() {
          this.sowingService = new SowingsApiService();
          this.loadSowings();
          this.initFilters();
        },
        beforeUnmount() {
          this.isUnmounted = true;
        },
      };
      </script>

      <template>
        <div class="section-container">
          <h1 class="section-title">
            Crop History
            <i class="pi pi-history icon-large" style="font-size: 2.5rem; margin-left: 0.5rem;"></i>
          </h1>
          <pv-data-table
            class="p-4"
            ref="dt"
            :value="sowings"
            v-model:selection="selectedSowing"
            dataKey="id"
            selectionMode="single"
            :paginator="true"
            :rows="5"
            :filters="filters"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} sowings"
          >
            <template #header>
              <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
                <pv-icon-field iconPosition="left">
                  <pv-input-icon>
                    <i class="pi pi-search" />
                  </pv-input-icon>
                  <pv-input-text v-model="filters['global'].value" placeholder="Search..." />
                </pv-icon-field>
              </div>
            </template>
            <pv-column field="crop_name" header="Crop" style="min-width:12rem"></pv-column>
            <pv-column field="start_date" header="Planted Date" style="min-width:16rem"></pv-column>
            <pv-column field="harvest_date" header="Harvest Date" style="min-width:16rem"></pv-column>
            <pv-column header="View record" style="min-width:12rem">
              <template #body="slotProps">
                <pv-button class="green-button" label="See" @click="showSowingDetails(slotProps.data)" />
              </template>
            </pv-column>
          </pv-data-table>

          <pv-dialog
            :visible.sync="selectedSowingDetailsVisible"
            modal
            header="Sowing Details"
            :style="{ width: '500px' }"
            @hide="closeDialog"
            :closable="true"
            :dismissable-mask="true"
          >
            <div class="flex flex-column align-items-center" v-if="crop && selectedSowing">
              <h2>{{ crop.name }}</h2>
              <img :src="crop.imageUrl" alt="Crop image" class="dialog-image" />
              <div v-if="rows.length" class="details-table">
                <div v-for="(row, index) in rows" :key="index" class="row">
                  <span class="label">{{ row[0] }}:</span>
                  <span class="value">{{ row[1] }}</span>
                </div>
              </div>
              <pv-button class="close-button" label="Close" @click="closeDialog" />
            </div>
          </pv-dialog>
        </div>
      </template>

<style scoped>

.dialog-image {
  width: 50%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
}

.details-table {
  width: 100%;
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: var(--surface-ground);
  border-radius: 6px;
}

.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid var(--surface-border);
}

.row:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.label {
  font-weight: 600;
  color: var(--text-color);
}

.value {
  color: var(--text-color-secondary);
}

.close-button {
  margin-top: 1.5rem;
  background-color: var(--primary-color);
  color: white;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: var(--primary-dark-color);
}
</style>