"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    const acme = await prisma.client.create({
        data: {
            type: client_1.ClientType.COMPANY,
            companyName: 'Acme Corp',
            legalId: '12345678901234',
            email: 'contact@acme.com',
            phone: '+33 1 23 45 67 89',
            address: '12 Rue de la Paix, 75001 Paris',
            notes: 'Long-standing enterprise client, Q2 renewal',
        },
    });
    const techstart = await prisma.client.create({
        data: {
            type: client_1.ClientType.COMPANY,
            companyName: 'TechStart SAS',
            legalId: '98765432100010',
            email: 'hello@techstart.io',
            phone: '+33 6 11 22 33 44',
            address: 'Station F, 5 Parv. Alan Turing, 75013 Paris',
        },
    });
    const nexgen = await prisma.client.create({
        data: {
            type: client_1.ClientType.COMPANY,
            companyName: 'NexGen Industries',
            legalId: '55544433300012',
            email: 'procurement@nexgen.fr',
            notes: 'Referred by Acme. Interested in premium tier.',
        },
    });
    const dupont = await prisma.client.create({
        data: {
            type: client_1.ClientType.INDIVIDUAL,
            firstName: 'Marie',
            lastName: 'Dupont',
            email: 'marie.dupont@gmail.com',
            phone: '+33 6 98 76 54 32',
            address: '8 Avenue Victor Hugo, 69001 Lyon',
        },
    });
    const martin = await prisma.client.create({
        data: {
            type: client_1.ClientType.INDIVIDUAL,
            firstName: 'Julien',
            lastName: 'Martin',
            email: 'j.martin@outlook.fr',
            phone: '+33 7 45 12 36 98',
            notes: 'Freelance consultant. High value, quick decisions.',
        },
    });
    const bernard = await prisma.client.create({
        data: {
            type: client_1.ClientType.INDIVIDUAL,
            firstName: 'Sophie',
            lastName: 'Bernard',
            email: 's.bernard@proton.me',
        },
    });
    console.log(`✅ Created ${6} clients`);
    const daysAgo = (n) => {
        const d = new Date();
        d.setDate(d.getDate() - n);
        return d;
    };
    const daysFromNow = (n) => {
        const d = new Date();
        d.setDate(d.getDate() + n);
        return d;
    };
    const opportunities = [
        {
            clientId: acme.id,
            title: 'Enterprise License Renewal 2026',
            amountCents: 1_500_000,
            currency: 'EUR',
            expectedSignatureDate: daysFromNow(30),
            stage: client_1.OpportunityStage.PROPOSAL,
            lastStageChangeAt: daysAgo(3),
        },
        {
            clientId: acme.id,
            title: 'Support Package Upgrade',
            amountCents: 350_000,
            currency: 'EUR',
            expectedSignatureDate: daysFromNow(15),
            stage: client_1.OpportunityStage.NEGOTIATION,
            lastStageChangeAt: daysAgo(1),
        },
        {
            clientId: techstart.id,
            title: 'Starter SaaS Subscription',
            amountCents: 99_00,
            currency: 'EUR',
            expectedSignatureDate: daysFromNow(7),
            stage: client_1.OpportunityStage.QUALIFIED,
            lastStageChangeAt: daysAgo(5),
        },
        {
            clientId: nexgen.id,
            title: 'Premium Onboarding Bundle',
            amountCents: 750_000,
            currency: 'EUR',
            expectedSignatureDate: daysFromNow(45),
            stage: client_1.OpportunityStage.LEAD,
            lastStageChangeAt: daysAgo(2),
        },
        {
            clientId: acme.id,
            title: 'Legacy Migration Project',
            amountCents: 2_000_000,
            currency: 'EUR',
            expectedSignatureDate: daysAgo(10),
            stage: client_1.OpportunityStage.NEGOTIATION,
            lastStageChangeAt: daysAgo(5),
        },
        {
            clientId: dupont.id,
            title: 'Personal Finance Dashboard',
            amountCents: 45_000,
            currency: 'EUR',
            expectedSignatureDate: daysAgo(5),
            stage: client_1.OpportunityStage.PROPOSAL,
            lastStageChangeAt: daysAgo(20),
        },
        {
            clientId: techstart.id,
            title: 'API Integration Consulting',
            amountCents: 300_000,
            currency: 'EUR',
            expectedSignatureDate: daysFromNow(20),
            stage: client_1.OpportunityStage.QUALIFIED,
            lastStageChangeAt: daysAgo(20),
        },
        {
            clientId: martin.id,
            title: 'Freelance Tooling Suite',
            amountCents: 120_000,
            currency: 'EUR',
            expectedSignatureDate: daysFromNow(60),
            stage: client_1.OpportunityStage.LEAD,
            lastStageChangeAt: daysAgo(30),
        },
        {
            clientId: nexgen.id,
            title: 'Initial Pilot Contract',
            amountCents: 500_000,
            currency: 'EUR',
            expectedSignatureDate: daysAgo(15),
            stage: client_1.OpportunityStage.WON,
            lastStageChangeAt: daysAgo(15),
        },
        {
            clientId: bernard.id,
            title: 'Solo Entrepreneur Package',
            amountCents: 79_00,
            currency: 'EUR',
            expectedSignatureDate: daysAgo(30),
            stage: client_1.OpportunityStage.WON,
            lastStageChangeAt: daysAgo(30),
        },
        {
            clientId: acme.id,
            title: 'Hardware Integration Bid',
            amountCents: 800_000,
            currency: 'EUR',
            expectedSignatureDate: daysAgo(60),
            stage: client_1.OpportunityStage.LOST,
            lastStageChangeAt: daysAgo(55),
        },
        {
            clientId: martin.id,
            title: 'Mobile App Development',
            amountCents: 450_000,
            currency: 'EUR',
            expectedSignatureDate: daysAgo(45),
            stage: client_1.OpportunityStage.LOST,
            lastStageChangeAt: daysAgo(40),
        },
    ];
    for (const opp of opportunities) {
        await prisma.opportunity.create({ data: opp });
    }
    console.log(`✅ Created ${opportunities.length} opportunities`);
    console.log('');
    console.log('📊 Breakdown:');
    console.log('   - 4 healthy active opportunities');
    console.log('   - 2 LATE (past expected date, not closed)');
    console.log('   - 2 STAGNANT (no stage change > 14 days)');
    console.log('   - 2 WON');
    console.log('   - 2 LOST');
    console.log('');
    console.log('🎉 Seed complete!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map