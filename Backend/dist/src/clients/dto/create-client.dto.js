"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateClientDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class CreateClientDto {
}
exports.CreateClientDto = CreateClientDto;
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ClientType),
    __metadata("design:type", String)
], CreateClientDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.type === client_1.ClientType.COMPANY),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Company name is required for company clients.' }),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateClientDto.prototype, "companyName", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.type === client_1.ClientType.COMPANY),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(50),
    __metadata("design:type", String)
], CreateClientDto.prototype, "legalId", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.type === client_1.ClientType.INDIVIDUAL),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'First name is required for individual clients.' }),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateClientDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.type === client_1.ClientType.INDIVIDUAL),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Last name is required for individual clients.' }),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateClientDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateClientDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(30),
    __metadata("design:type", String)
], CreateClientDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClientDto.prototype, "notes", void 0);
//# sourceMappingURL=create-client.dto.js.map