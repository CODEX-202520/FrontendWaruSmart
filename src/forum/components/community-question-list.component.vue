<script>
import {FilterMatchMode} from "primevue/api";
import AnswerList from "./answer-list.component.vue";


export default {
  name: "community-question-list",
  components: {AnswerList},
  props:{
    dataSource: Array,
  },
  data(){
    return{
      filters:{},
      selectedQuestion: Object,
      isQuestionSelected: false
    }
  },
  methods:{
    initFilters() {
      this.filters = {global: {value: null, matchMode: FilterMatchMode.CONTAINS}};
    },
    rowClick(event, rowData) {
      this.selectedQuestion = rowData;
      console.log(this.selectedQuestion);
      this.isQuestionSelected = true;
    },
    returnQuestionsTable(){
      this.isQuestionSelected = false;
    },
    formatDate(value) {
      return new Date(value).toLocaleDateString('en-GB');
    }
  },
  created() {
    this.initFilters();
  }
}
</script>

<template>
  <div v-if="!isQuestionSelected">
    <pv-data-table
        ref="dt"
        :value="dataSource"
        v-model:selection="selectedQuestion"
        dataKey="id" selectionMode="single"
        :paginator="true"
        :rows="5"
        :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5,10,25]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products">
      <template #header>
        <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
          <pv-icon-field iconPosition="left">
            <pv-input-icon>
              <i class="pi pi-search" />
            </pv-input-icon>
            <pv-input-text v-model="filters['global'].value" :placeholder="$t('searchPlaceholder')" />
          </pv-icon-field>
        </div>
      </template>
      <pv-column field="ask" header="Ask" style="min-width:15rem"></pv-column>
      <pv-column field="category" header="Category" style="min-width:8rem"></pv-column>
      <pv-column field="date" header="Date" style="min-width:8rem">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.date) }}
        </template>
      </pv-column>
      <pv-column field="userName" header="User Name" style="min-width:12rem"></pv-column>

      <pv-column header="Actions" :exportable="false" style="min-width:3rem">
        <template #body="slotProps">
          <pv-button icon="pi pi-comments" outlined rounded class="mr-2" @click="rowClick($event,slotProps.data)"/>
        </template>
      </pv-column>
    </pv-data-table>
  </div>

  <div v-if="isQuestionSelected" class="position-relative">
    <div class="position-absolute top-0 start-0 mt-2 ms-2">
      <pv-button class=" button-green" :label="$t('back')" @click="returnQuestionsTable()"/>
    </div>
   <answer-list :question="selectedQuestion" :is-community-answers="true"/>
  </div>
</template>

<style scoped>

</style>