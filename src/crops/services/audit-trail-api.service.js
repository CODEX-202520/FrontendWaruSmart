import http from "../../shared/services/http-common";

export class AuditTrailApiService {
    async createAudit(sowingId, audit, imageFile) {
        const formData = new FormData();
        
        // Agregar campos individuales al FormData
        formData.append('description', audit.description);
        formData.append('soilMoisture', audit.soilMoisture.toString());
        formData.append('soilTemperature', audit.soilTemperature.toString());
        formData.append('airTemperature', audit.airTemperature.toString());
        formData.append('airHumidity', audit.airHumidity.toString());
        formData.append('phenologicalPhase', audit.phenologicalPhase);
        
        // Agregar la imagen
        if (imageFile) {
            formData.append('image', imageFile);
        }

        // Debug - ver contenido del FormData
        console.log('Sending audit data:');
        for (let pair of formData.entries()) {
            console.log('FormData field:', pair[0], pair[1]);
        }
        
        return http.post(`/crops/sowing/${sowingId}/audit-trail`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    downloadReport(sowingId) {
        return http.get(`/crops/sowing/${sowingId}/audit-trail/report`, {
            responseType: 'blob'
        });
    }
}