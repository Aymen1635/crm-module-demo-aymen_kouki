"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeRiskLabel = computeRiskLabel;
const client_1 = require("@prisma/client");
const CLOSED_STAGES = [
    client_1.OpportunityStage.WON,
    client_1.OpportunityStage.LOST,
];
function computeRiskLabel(opp) {
    if (CLOSED_STAGES.includes(opp.stage))
        return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const expectedDate = new Date(opp.expectedSignatureDate);
    const signatureDay = new Date(expectedDate.getFullYear(), expectedDate.getMonth(), expectedDate.getDate());
    const isLate = signatureDay < today;
    const thresholdDays = parseInt(process.env.STAGNANT_THRESHOLD_DAYS ?? '14', 10);
    const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;
    const isStagnant = now.getTime() - opp.lastStageChangeAt.getTime() > thresholdMs;
    if (isLate)
        return 'late';
    if (isStagnant)
        return 'stagnant';
    return null;
}
//# sourceMappingURL=opportunity-risk.util.js.map