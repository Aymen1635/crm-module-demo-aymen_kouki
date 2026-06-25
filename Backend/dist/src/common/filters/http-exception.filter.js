"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
function isPrismaKnownError(err) {
    return err instanceof client_1.Prisma.PrismaClientKnownRequestError;
}
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    constructor() {
        this.logger = new common_1.Logger(HttpExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const { status, message, errors } = this.resolve(exception);
        this.logger.error(`[${status}] ${message}`, exception instanceof Error ? exception.stack : undefined);
        response.status(status).json({
            statusCode: status,
            message,
            ...(errors ? { errors } : {}),
            timestamp: new Date().toISOString(),
        });
    }
    resolve(exception) {
        if (exception instanceof common_1.HttpException) {
            const res = exception.getResponse();
            if (typeof res === 'object' && res !== null && 'message' in res) {
                const r = res;
                if (Array.isArray(r.message)) {
                    return {
                        status: exception.getStatus(),
                        message: 'Validation failed',
                        errors: r.message,
                    };
                }
                return {
                    status: exception.getStatus(),
                    message: String(r.message),
                };
            }
            return {
                status: exception.getStatus(),
                message: String(res),
            };
        }
        if (isPrismaKnownError(exception)) {
            return this.mapPrismaError(exception);
        }
        return {
            status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
        };
    }
    mapPrismaError(err) {
        switch (err.code) {
            case 'P2002':
                return {
                    status: common_1.HttpStatus.CONFLICT,
                    message: 'A record with this value already exists.',
                };
            case 'P2025':
                return {
                    status: common_1.HttpStatus.NOT_FOUND,
                    message: 'Record not found.',
                };
            case 'P2003':
                return {
                    status: common_1.HttpStatus.CONFLICT,
                    message: 'Cannot delete this record because it is referenced by other records.',
                };
            case 'P2014':
                return {
                    status: common_1.HttpStatus.CONFLICT,
                    message: 'Relation constraint violation.',
                };
            default:
                return {
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Database error.',
                };
        }
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map