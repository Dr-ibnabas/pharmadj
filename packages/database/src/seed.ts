import { PrismaClient, Role, FormeGalenique, StatutProduit, Sexe } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seed de la base de données...');

  // ============================================
  // UTILISATEURS
  // ============================================
  console.log('👥 Création des utilisateurs...');
  
  const motDePasseHash = (mdp: string) => bcrypt.hash(mdp, 12);

  const admin = await prisma.utilisateur.upsert({
    where: { email: 'admin@pharma.dj' },
    update: {},
    create: {
      email: 'admin@pharma.dj',
      motDePasse: await motDePasseHash('Admin@2026'),
      nom: 'ADMIN',
      prenom: 'Système',
      telephone: '+25321000000',
      role: Role.ADMIN,
    },
  });

  const pharmacien = await prisma.utilisateur.upsert({
    where: { email: 'pharmacien@pharma.dj' },
    update: {},
    create: {
      email: 'pharmacien@pharma.dj',
      motDePasse: await motDePasseHash('Pharma@2026'),
      nom: 'OMAR',
      prenom: 'Ahmed',
      telephone: '+25321000001',
      role: Role.PHARMACIEN_TITULAIRE,
    },
  });

  const caissier = await prisma.utilisateur.upsert({
    where: { email: 'caissier@pharma.dj' },
    update: {},
    create: {
      email: 'caissier@pharma.dj',
      motDePasse: await motDePasseHash('Caisse@2026'),
      nom: 'HASSAN',
      prenom: 'Fatouma',
      telephone: '+25321000002',
      role: Role.CAISSIER,
    },
  });

  // ============================================
  // FAMILLES PRODUITS
  // ============================================
  console.log('📁 Création des familles de produits...');

  const familles = [
    { code: 'ANTIB', nom: 'Antibiotiques', description: 'Médicaments antibactériens' },
    { code: 'ANALG', nom: 'Antalgiques', description: 'Médicaments contre la douleur' },
    { code: 'ANTIPYR', nom: 'Antipyrétiques', description: 'Contre la fièvre' },
    { code: 'ANTIH', nom: 'Antihypertenseurs', description: 'Contre l\'hypertension' },
    { code: 'ANTID', nom: 'Antidiabétiques', description: 'Contre le diabète' },
    { code: 'VITAM', nom: 'Vitamines', description: 'Compléments vitaminiques' },
    { code: 'PARAP', nom: 'Parapharmacie', description: 'Produits de parapharmacie' },
    { code: 'DERMA', nom: 'Dermatologie', description: 'Produits dermatologiques' },
  ];

  const famillesCrees = await Promise.all(
    familles.map(f =>
      prisma.familleProduit.upsert({
        where: { code: f.code },
        update: {},
        create: f,
      })
    )
  );

  // ============================================
  // LABORATOIRES
  // ============================================
  console.log('🏭 Création des laboratoires...');

  const laboratoires = [
    { nom: 'Sanofi', pays: 'France' },
    { nom: 'Pfizer', pays: 'États-Unis' },
    { nom: 'Novartis', pays: 'Suisse' },
    { nom: 'GSK', pays: 'Royaume-Uni' },
    { nom: 'Bayer', pays: 'Allemagne' },
    { nom: 'Cipla', pays: 'Inde' },
    { nom: 'Generic Pharma', pays: 'Inde' },
  ];

  const laboratoiresCrees = await Promise.all(
    laboratoires.map(l =>
      prisma.laboratoire.upsert({
        where: { nom: l.nom },
        update: {},
        create: l,
      })
    )
  );

  // ============================================
  // PRODUITS
  // ============================================
  console.log('💊 Création des produits...');

  const produits = [
    {
      codeInterne: 'P0001',
      codeBarres: '3400930000001',
      nomCommercial: 'Doliprane 1000mg',
      dci: 'Paracétamol',
      dosage: '1000mg',
      formeGalenique: FormeGalenique.COMPRIME,
      conditionnement: 'Boîte de 8',
      laboratoireId: laboratoiresCrees[0].id,
      familleId: famillesCrees[1].id,
      classeATC: 'N02BE01',
      statut: StatutProduit.VENTE_LIBRE,
      prixAchatHT: 800,
      tauxTVA: 0,
      prixVenteTTC: 1200,
      stockMinimum: 20,
      pointCommande: 30,
      emplacement: 'A1-01',
    },
    {
      codeInterne: 'P0002',
      codeBarres: '3400930000002',
      nomCommercial: 'Amoxicilline 500mg',
      dci: 'Amoxicilline',
      dosage: '500mg',
      formeGalenique: FormeGalenique.GELULE,
      conditionnement: 'Boîte de 12',
      laboratoireId: laboratoiresCrees[5].id,
      familleId: famillesCrees[0].id,
      classeATC: 'J01CA04',
      statut: StatutProduit.SUR_ORDONNANCE,
      prixAchatHT: 1500,
      tauxTVA: 0,
      prixVenteTTC: 2200,
      stockMinimum: 15,
      pointCommande: 25,
      emplacement: 'A2-03',
    },
    {
      codeInterne: 'P0003',
      codeBarres: '3400930000003',
      nomCommercial: 'Ibuprofène 400mg',
      dci: 'Ibuprofène',
      dosage: '400mg',
      formeGalenique: FormeGalenique.COMPRIME,
      conditionnement: 'Boîte de 30',
      laboratoireId: laboratoiresCrees[3].id,
      familleId: famillesCrees[1].id,
      classeATC: 'M01AE01',
      statut: StatutProduit.VENTE_LIBRE,
      prixAchatHT: 1200,
      tauxTVA: 0,
      prixVenteTTC: 1800,
      stockMinimum: 25,
      pointCommande: 40,
      emplacement: 'A1-05',
    },
    {
      codeInterne: 'P0004',
      codeBarres: '3400930000004',
      nomCommercial: 'Metformine 850mg',
      dci: 'Metformine',
      dosage: '850mg',
      formeGalenique: FormeGalenique.COMPRIME,
      conditionnement: 'Boîte de 30',
      laboratoireId: laboratoiresCrees[2].id,
      familleId: famillesCrees[4].id,
      classeATC: 'A10BA02',
      statut: StatutProduit.SUR_ORDONNANCE,
      prixAchatHT: 2000,
      tauxTVA: 0,
      prixVenteTTC: 3000,
      stockMinimum: 20,
      pointCommande: 30,
      emplacement: 'B1-02',
    },
    {
      codeInterne: 'P0005',
      codeBarres: '3400930000005',
      nomCommercial: 'Amlodipine 5mg',
      dci: 'Amlodipine',
      dosage: '5mg',
      formeGalenique: FormeGalenique.COMPRIME,
      conditionnement: 'Boîte de 30',
      laboratoireId: laboratoiresCrees[1].id,
      familleId: famillesCrees[3].id,
      classeATC: 'C08CA01',
      statut: StatutProduit.SUR_ORDONNANCE,
      prixAchatHT: 1800,
      tauxTVA: 0,
      prixVenteTTC: 2700,
      stockMinimum: 15,
      pointCommande: 25,
      emplacement: 'B1-04',
    },
    {
      codeInterne: 'P0006',
      codeBarres: '3400930000006',
      nomCommercial: 'Vitamine C 1000mg',
      dci: 'Acide ascorbique',
      dosage: '1000mg',
      formeGalenique: FormeGalenique.COMPRIME,
      conditionnement: 'Tube de 20',
      laboratoireId: laboratoiresCrees[6].id,
      familleId: famillesCrees[5].id,
      classeATC: 'A11GA01',
      statut: StatutProduit.VENTE_LIBRE,
      prixAchatHT: 600,
      tauxTVA: 0,
      prixVenteTTC: 1000,
      stockMinimum: 30,
      pointCommande: 50,
      emplacement: 'C1-01',
    },
    {
      codeInterne: 'P0007',
      codeBarres: '3400930000007',
      nomCommercial: 'Smecta',
      dci: 'Diosmectite',
      dosage: '3g',
      formeGalenique: FormeGalenique.POUDRE,
      conditionnement: 'Boîte de 30 sachets',
      laboratoireId: laboratoiresCrees[0].id,
      familleId: famillesCrees[6].id,
      statut: StatutProduit.VENTE_LIBRE,
      prixAchatHT: 2500,
      tauxTVA: 0,
      prixVenteTTC: 3500,
      stockMinimum: 10,
      pointCommande: 20,
      emplacement: 'C2-01',
    },
    {
      codeInterne: 'P0008',
      codeBarres: '3400930000008',
      nomCommercial: 'Bétadine solution',
      dci: 'Povidone iodée',
      dosage: '10%',
      formeGalenique: FormeGalenique.GOUTTES,
      conditionnement: 'Flacon 125ml',
      laboratoireId: laboratoiresCrees[0].id,
      familleId: famillesCrees[7].id,
      statut: StatutProduit.VENTE_LIBRE,
      prixAchatHT: 1500,
      tauxTVA: 0,
      prixVenteTTC: 2200,
      stockMinimum: 15,
      pointCommande: 25,
      emplacement: 'D1-01',
    },
  ];

  for (const p of produits) {
    await prisma.produit.upsert({
      where: { codeInterne: p.codeInterne },
      update: {},
      create: p,
    });
  }

  // ============================================
  // FOURNISSEURS
  // ============================================
  console.log('🚚 Création des fournisseurs...');

  await prisma.fournisseur.create({
    data: {
      raisonSociale: 'COPHARMED',
      nif: 'DJ-NIF-001',
      contactPrincipal: 'Mohamed ALI',
      telephone: '+25321350000',
      email: 'commande@copharmed.dj',
      adresse: 'Zone Industrielle, Djibouti',
      ville: 'Djibouti',
      pays: 'Djibouti',
      conditionsPaiement: '30 jours',
      delaiLivraison: 5,
    },
  });

  await prisma.fournisseur.create({
    data: {
      raisonSociale: 'PHARMA DISTRIBUTION SA',
      nif: 'DJ-NIF-002',
      contactPrincipal: 'Aïcha MOUSSA',
      telephone: '+25321360000',
      email: 'contact@pharmadistrib.dj',
      adresse: 'Avenue 26, Djibouti',
      ville: 'Djibouti',
      conditionsPaiement: '45 jours',
      delaiLivraison: 7,
    },
  });

  // ============================================
  // MUTUELLES
  // ============================================
  console.log('🛡️ Création des mutuelles...');

  await prisma.mutuelle.upsert({
    where: { nom: 'CNSS' },
    update: {},
    create: {
      nom: 'CNSS',
      contact: 'Service Pharmacie',
      telephone: '+25321350011',
      email: 'pharmacie@cnss.dj',
      adresse: 'Place du 27 juin, Djibouti',
      tauxPriseEnCharge: 80,
      conventionne: true,
    },
  });

  await prisma.mutuelle.upsert({
    where: { nom: 'AMERGA' },
    update: {},
    create: {
      nom: 'AMERGA',
      contact: 'Direction Médicale',
      telephone: '+25321350022',
      email: 'remboursement@amerga.dj',
      tauxPriseEnCharge: 70,
      conventionne: true,
    },
  });

  // ============================================
  // CLIENTS DE DÉMONSTRATION
  // ============================================
  console.log('👤 Création des clients de démonstration...');

  await prisma.client.upsert({
    where: { numeroClient: 'C0001' },
    update: {},
    create: {
      numeroClient: 'C0001',
      nom: 'ABDOULKADER',
      prenom: 'Ismaël',
      dateNaissance: new Date('1985-05-15'),
      sexe: Sexe.HOMME,
      telephone: '+25377112233',
      email: 'ismael.a@example.dj',
      adresse: 'Quartier 4, Djibouti',
      pathologiesChroniques: 'Hypertension artérielle',
      traitementsEnCours: 'Amlodipine 5mg, 1cp/jour',
      pointsFidelite: 150,
    },
  });

  await prisma.client.upsert({
    where: { numeroClient: 'C0002' },
    update: {},
    create: {
      numeroClient: 'C0002',
      nom: 'FARAH',
      prenom: 'Khadija',
      dateNaissance: new Date('1992-09-22'),
      sexe: Sexe.FEMME,
      telephone: '+25377445566',
      adresse: 'Balbala, Djibouti',
      allergies: 'Pénicilline',
      pointsFidelite: 75,
    },
  });

  // ============================================
  // CONFIGURATION
  // ============================================
  console.log('⚙️ Configuration de la pharmacie...');

  const configs = [
    { cle: 'PHARMACIE_NOM', valeur: 'Pharmacie Centrale', description: 'Nom de la pharmacie' },
    { cle: 'PHARMACIE_ADRESSE', valeur: 'Place du 27 juin, Djibouti', description: 'Adresse' },
    { cle: 'PHARMACIE_TELEPHONE', valeur: '+253 21 35 00 00', description: 'Téléphone' },
    { cle: 'PHARMACIE_EMAIL', valeur: 'contact@pharmacie.dj', description: 'Email' },
    { cle: 'DEVISE', valeur: 'FDJ', description: 'Devise par défaut' },
    { cle: 'TVA_DEFAUT', valeur: '0', type: 'number', description: 'TVA par défaut (%)' },
    { cle: 'POINTS_FIDELITE_RATIO', valeur: '100', type: 'number', description: 'FDJ par point' },
    { cle: 'PEREMPTION_ALERTE_JOURS', valeur: '90', type: 'number', description: 'Alerte péremption (jours)' },
  ];

  for (const config of configs) {
    await prisma.configuration.upsert({
      where: { cle: config.cle },
      update: { valeur: config.valeur },
      create: config,
    });
  }

  console.log('✅ Seed terminé avec succès !');
  console.log('');
  console.log('📋 Comptes de démonstration :');
  console.log('   Admin       : admin@pharma.dj / Admin@2026');
  console.log('   Pharmacien  : pharmacien@pharma.dj / Pharma@2026');
  console.log('   Caissier    : caissier@pharma.dj / Caisse@2026');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
