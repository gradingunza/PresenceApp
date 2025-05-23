var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { DateTime } from 'luxon';
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm';
import User from '#models/user';
export default class Presence extends BaseModel {
    getDuration() {
        if (!this.checkOut)
            return null;
        const duration = this.checkOut.diff(this.checkIn, ['hours', 'minutes']);
        return `${duration.hours}h${duration.minutes.toString().padStart(2, '0')}`;
    }
    isInOffice(officeLat, officeLng, maxDistance = 100) {
        if (!this.latitude || !this.longitude)
            return false;
        const R = 6371e3;
        const φ1 = (this.latitude * Math.PI) / 180;
        const φ2 = (officeLat * Math.PI) / 180;
        const Δφ = ((officeLat - this.latitude) * Math.PI) / 180;
        const Δλ = ((officeLng - this.longitude) * Math.PI) / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return distance <= maxDistance;
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", Number)
], Presence.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Presence.prototype, "userId", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], Presence.prototype, "checkIn", void 0);
__decorate([
    column.dateTime(),
    __metadata("design:type", Object)
], Presence.prototype, "checkOut", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Presence.prototype, "status", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Presence.prototype, "notes", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Presence.prototype, "latitude", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Presence.prototype, "longitude", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Presence.prototype, "ssid", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], Presence.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], Presence.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => User),
    __metadata("design:type", Object)
], Presence.prototype, "user", void 0);
//# sourceMappingURL=presence.js.map