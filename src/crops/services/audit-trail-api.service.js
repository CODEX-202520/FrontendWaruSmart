import http from "../../shared/services/http-common";

export class AuditTrailApiService {
    createAudit(sowingId, audit) {
        console.log('Enviando al backend:', { sowingId, audit });
        return http.post(`/crops/sowing/${sowingId}/audit-trail`, audit);
    }

    downloadReport(sowingId) {
        return http.get(`/crops/sowing/${sowingId}/audit-trail/report`, {
            responseType: 'blob'
        });
    }
}