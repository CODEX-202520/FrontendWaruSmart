export class Subscription {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.price = data.price;
        this.durationInDays = data.durationInDays;
        this.isActive = data.isActive;
    }
}