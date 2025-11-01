<script>
import {ForumApiService} from "../services/forum-api.service.js";
import {Answer} from "../model/answer.entity.js";
import {FilterMatchMode} from "primevue/api";
import AnswerItemCreateDialog from "./answer-item-create-dialog.component.vue";
import SowingItemCreateAndEditDialog from "../../crops/components/sowing-item-create-and-edit-dialog.component.vue";



export default {
  name: "answer-list",
  components: {SowingItemCreateAndEditDialog, AnswerItemCreateDialog},
  props:{
    question: Object,
    isCommunityAnswers: Boolean
  },
  data(){
    return{
      answers: [],
      answer: {},
      profiles: [],
      filters: {},
      forumService: null,
      headerContent: '',
      createAndEditDialogIsVisible: false,
      isEdit: false,
      submitted: false,
      currentUserId: localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId'), 10) : null
    }
  },
  methods: {
    findIndexById(id) {
      return this.answers.findIndex((answer) => answer.id === id);
    },
    initFilters() {
      this.filters = {global: {value: null, matchMode: FilterMatchMode.CONTAINS}};
    },
    createAnswer() {
      // Obtener el ID del usuario autenticado del localStorage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('No se encontró el ID del usuario autenticado.');
        return;
      }

      this.answer.questionId = this.question.id;
      this.answer.authorId = parseInt(userId, 10); // Convertir a número
      this.answer = Answer.fromDisplayableAnswer(this.answer);
      
      console.log('Creando respuesta con:', {
        questionId: this.answer.questionId,
        authorId: this.answer.authorId,
        content: this.answer.content
      });

      this.forumService.createAnswer(this.answer)
          .then((response) => {
            console.log('Respuesta del servidor:', response.data);
            const buildItemData = this.buildItemData(response.data);
            const newAnswer = Answer.toDisplayableAnswer(buildItemData);
            this.answers.push(newAnswer);
            this.answer = {};
          })
          .catch(error => {
            console.error('Error al crear la respuesta:', error);
          });
    },
    onNewItemEventHandler() {
      this.answer = {};
      this.submitted = false;
      this.isEdit = false;
      this.createAndEditDialogIsVisible = true;
    },
    onCanceledEventHandler() {
      this.createAndEditDialogIsVisible = false;
      this.submitted = false;
      this.isEdit = false;
    },

    onSavedEventHandler(item) {
      this.submitted = true;
      if (this.answer.content.trim()) {
        if (item.id) {
          this.updateSowing();
        } else {
          this.createAnswer();
        }
      }
      this.createAndEditDialogIsVisible = false;
      this.isEdit = false;
    },

    confirmDeleteAnswer(answer) {
      this.$confirm.require({
        message: '¿Estás seguro de que quieres eliminar esta respuesta?',
        header: 'Confirmar eliminación',
        icon: 'pi pi-exclamation-triangle',
        accept: () => this.deleteAnswer(answer),
        reject: () => {}
      });
    },
    deleteAnswer(answer) {
      this.forumService.deleteAnswer(answer.id)
        .then(() => {
          this.answers = this.answers.filter(a => a.id !== answer.id);
          this.$toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Respuesta eliminada correctamente',
            life: 3000
          });
        })
        .catch(error => {
          console.error('Error al eliminar la respuesta:', error);
          this.$toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar la respuesta',
            life: 3000
          });
        });
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ''; // Verifica si la fecha es válida
      
      try {
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        console.error('Error formatting date:', e);
        return '';
      }
    },
    buildHeaderContent() {
      let header = `${this.question.ask} - Por: ${this.question.userName}`;
      if (this.question.date) {
        const formattedDate = this.formatDate(this.question.date);
        header += ` - ${formattedDate}`;
      }
      this.headerContent = header;
    },
    buildData() {
      this.answers = this.answers.map((answer) => {
        console.log('Procesando respuesta con authorId:', answer.authorId);
        
        const profile = this.profiles.find(profile => {
          console.log('Comparando authorId:', answer.authorId, 'con userId:', profile.userId);
          return profile.userId === answer.authorId;
        });
        
        console.log('Perfil encontrado:', profile ? `${profile.fullName} (${profile.userId})` : 'no encontrado');
        
        return {
          ...answer,
          userName: profile?.fullName || 'Usuario desconocido',
        };
      });
    },

    buildItemData(data) {
      const profile = this.profiles.find((profile) => profile.userId === data.authorId);
      console.log("Building item with authorId:", data.authorId);
      console.log("Found profile:", profile);
      return {
        ...data,
        userName: profile?.fullName || 'Usuario desconocido'
      };
    },

    async getAllProfiles() {
      await this.forumService.getAllProfiles().then((response) => {
        this.profiles = response.data;
        console.log("Profiles loaded:", this.profiles.map(p => ({userId: p.userId, fullName: p.fullName})));
      });
      return this.profiles;
    },

    getAnswers() {
      this.forumService.getAnswerByQuestionId(this.question.id)
          .then((response) => {
            let answers = response.data;
            console.log('Respuestas sin procesar:', answers);
            
            this.answers = answers.map((answer) => {
              const displayableAnswer = Answer.toDisplayableAnswer(answer);
              console.log('Respuesta convertida:', displayableAnswer);
              return displayableAnswer;
            });
            
            console.log('Respuestas antes de buildData:', this.answers);
            this.buildData();
            console.log('Respuestas después de buildData:', this.answers);
          })
          .catch(error => {
            console.error('Error al obtener respuestas:', error);
          });
    },
  },
  created() {
    this.forumService = new ForumApiService();
    this.initFilters();
    this.buildHeaderContent();
    
    this.getAllProfiles().then(() => {
      this.getAnswers();
    }).catch(error => {
      console.error('Error cargando perfiles:', error);
    });
  }
}
</script>

<template>
  <pv-toast />
  <div>
    <pv-data-table
        ref="dt"
        :value="answers"
        dataKey="id" selectionMode="single"
        :paginator="true"
        :rows="3"
        :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[3,6,9]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products">
      <template #header v-if="isCommunityAnswers">

        <pv-button :label="$t('addAnswer')" icon="pi pi-plus"  class="mr-2 button-brown" @click="onNewItemEventHandler" />
      </template>
      <pv-column field="userName" :header="headerContent">
        <template #body="content">
          <div class="answer-container">
            <div class="answer-header">
              <div class="user-info">
                <h5 class="user-name">{{content.data.userName}}</h5>
              </div>
              <div class="answer-actions" v-if="currentUserId === content.data.authorId">
                <pv-button 
                  icon="pi pi-trash" 
                  severity="danger" 
                  outlined 
                  rounded
                  @click="confirmDeleteAnswer(content.data)"
                />
              </div>
            </div>
            <div class="answer-content">
              <p>{{content.data.content}}</p>
            </div>
          </div>
        </template>
      </pv-column>

    </pv-data-table>
  </div>

  <answer-item-create-dialog
      :entity="answer"
      :visible="createAndEditDialogIsVisible"
      entityName="Answer"
      :edit="isEdit"
      v-on:canceled="onCanceledEventHandler"
      v-on:saved="onSavedEventHandler($event)"
  />
</template>

<style scoped>
.answer-container {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin: 0.5rem 0;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.answer-actions {
  display: flex;
  gap: 0.5rem;
}

.user-name {
  margin: 0;
  color: #495057;
  font-weight: 600;
}

.answer-date {
  color: #6c757d;
  font-size: 0.875rem;
}

.answer-content {
  color: #212529;
  line-height: 1.5;
}

.answer-content p {
  margin: 0;
}
</style>