import moment from 'moment';
import { CropsRecomendationApiService } from "../services/crops-recomendation-api.service.js";

export class Sowing {
    constructor(id = '', start_date = '', harvest_date = '', area_land = 0, user_id = '', crop_id = '', crop_name = '', phenological_phase = 0) {
        this.id = id;
        this.start_date = start_date;
        this.harvest_date = harvest_date;
        this.area_land = area_land;
        this.user_id = user_id;
        this.crop_id = crop_id;
        this.crop_name = crop_name;
        this.phenological_phase = phenological_phase;
    }

    static fromDisplayableSowing(displayableSowing) {
        return new Sowing(
            displayableSowing.id,
            displayableSowing.start_date,
            displayableSowing.harvest_date,
            displayableSowing.area_land,
            displayableSowing.user_id,
            displayableSowing.crop_id,
            displayableSowing.crop_name,
            displayableSowing.phenological_phase
        );
    }

    static async toDisplayableSowing(sowing) {
        const cropApiService = new CropsRecomendationApiService();
        let cropName = '';

        try {
            const cropResponse = await cropApiService.getCropById(sowing.cropId);
            cropName = cropResponse.data.name;
        } catch (error) {
            console.error('Error fetching crop name:', error);
        }

        const phenologicalPhaseNames = ['Germination',
            'Tillering',
            'Stem Elongation',
            'Booting',
            'Heading',
            'Flowering',
            'Grain Filling',
            'Ripening',
            'Harvest Ready'
        ];

        return {
            id: sowing.id,
            start_date: moment(sowing.startDate).format('YYYY-MM-DD'),
            harvest_date: moment(sowing.endDate).format('YYYY-MM-DD'), 
            area_land: sowing.areaLand,
            user_id: sowing.userId,
            crop_id: sowing.cropId,
            crop_name: cropName,
            phenological_phase: phenologicalPhaseNames[sowing.phenologicalPhase]
        };
    }
}