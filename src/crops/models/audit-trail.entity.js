export class AuditTrail {
    constructor(id, sowingId, description, soilMoisture, soilTemperature, airTemperature, airHumidity, imageUrl) {
        this.id = id;
        this.sowingId = sowingId;
        this.description = description;
        this.soilMoisture = soilMoisture;
        this.soilTemperature = soilTemperature;
        this.airTemperature = airTemperature;
        this.airHumidity = airHumidity;
        this.imageUrl = imageUrl;
    }
}