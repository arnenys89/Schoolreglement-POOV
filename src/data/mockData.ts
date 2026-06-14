import { School, SchoolBoard, RegulationSection, PDFConfig } from "../types";

export const defaultSchoolBoard: SchoolBoard = {
  name: "Provinciebestuur Oost-Vlaanderen",
  address: "Charles de Kerchovelaan 189, 9000 Gent",
  phone: "09 267 74 23",
  website: "http://www.oost-vlaanderen.be",
  type: "Officieel gesubsidieerd onderwijs - Provinciaal onderwijs",
  number: "960088",
  showSchoolSelector: false,
  showWelcomeCard: false,
  logoUrl: "https://www.ugent.be/re/img/faculteit-rechten/logos/logo-provincie-oostvlaanderen.png/@@images/image.png",
};

export const defaultSchools: School[] = [
  {
    id: "36467",
    name: "Richtpunt campus Eeklo",
    address: "Roze 131, 9900 Eeklo",
    phone: "09 376 71 11",
    email: "eeklo@richtpunt.be",
    website: "https://richtpunt.be/eeklo",
    logoType: "custom_url",
    logoValue: "https://richtpunt.be/eeklo/wp-content/uploads/sites/3/2024/06/Richtpunt-campus-Eeklo-geel-1024x388.png",
  },
  {
    id: "36624",
    name: "Richtpunt campus Gent Henleykaai",
    address: "Henleykaai 83, 9000 Gent",
    phone: "09 267 12 90",
    email: "henleykaai@richtpunt.be",
    website: "https://richtpunt.be/henleykaai",
    logoType: "custom_url",
    logoValue: "https://richtpunt.be/genthenleykaai/wp-content/uploads/sites/4/2024/07/Richtpunt-campus-Gent-Henleykaai-geel-1024x283.png",
  },
  {
    id: "36699",
    name: "Richtpunt campus Gent Godshuizenlaan",
    address: "Godshuizenlaan 65, 9000 Gent",
    phone: "09 267 50 00",
    email: "godshuizenlaan@richtpunt.be",
    website: "https://richtpunt.be/godshuizenlaan",
    logoType: "custom_url",
    logoValue: "https://richtpunt.be/gentoudenaarde/wp-content/uploads/sites/5/2024/06/Richtpunt-campus-Gent-Oudenaarde-geel-1024x251.png",
  },
  {
    id: "37275",
    name: "Richtpunt Campus Hamme",
    address: "Meulenbroekstraat 15, 9220 Hamme",
    phone: "052 47 04 11",
    email: "hamme@richtpunt.be",
    website: "https://richtpunt.be/hamme",
    logoType: "custom_url",
    logoValue: "https://richtpunt.be/hamme/wp-content/uploads/sites/6/2024/06/Richtpunt-campus-Hamme-geel.png",
  },
  {
    id: "37903",
    name: "Richtpunt campus Oudenaarde",
    address: "Minderbroedersstraat 6, 9700 Oudenaarde",
    phone: "055 31 16 35",
    email: "oudenaarde@richtpunt.be",
    website: "https://richtpunt.be/oudenaarde",
    logoType: "custom_url",
    logoValue: "https://richtpunt.be/gentoudenaarde/wp-content/uploads/sites/5/2024/06/Richtpunt-campus-Gent-Oudenaarde-geel-1024x251.png",
  },
  {
    id: "46862",
    name: "Richtpunt campus Gent Abdisstraat",
    address: "Abdisstraat 56, 9000 Gent",
    phone: "09 223 37 45",
    email: "abdisstraat@richtpunt.be",
    website: "https://richtpunt.be/abdisstraat",
    logoType: "custom_url",
    logoValue: "https://richtpunt.be/gentoudenaarde/wp-content/uploads/sites/5/2024/06/Richtpunt-campus-Gent-Oudenaarde-geel-1024x251.png",
  },
  {
    id: "145722",
    name: "Richtpunt campus Ninove-Zottegem",
    address: "Sabina van Beierenlaan 35, 9620 Zottegem",
    phone: "054 33 34 26",
    email: "ninovezottegem@richtpunt.be",
    website: "https://richtpunt.be/ninovezottegem",
    logoType: "custom_url",
    logoValue: "https://richtpunt.be/ninovezottegem/wp-content/uploads/sites/7/2024/06/cropped-logo_ninovezottegem_geel.png",
  },
];

export const defaultPDFConfig: PDFConfig = {
  schoolLogo: "default",
  h1Size: 22,
  h2Size: 16,
  h3Size: 12,
  bodySize: 10,
  fontFamily: "Meta Pro Light",
  showTOC: true,
  headerText: "Schoolreglement Provincie Oost-Vlaanderen - Schooljaar 2026-2027",
  footerText: "Pagina [page] van [topage]",
  filenameTemplate: "Reglement_{School}_{Jaar}.pdf",
};

export const defaultSections: RegulationSection[] = [
  // Chapter 1: Onze school
  {
    id: "1",
    title: "Onze school",
    chapterNumber: 1,
    sectionNumber: "1",
    level: 1,
    type: 'text',
    icon: "School",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `Welkom op de school van de Provincie Oost-Vlaanderen. Het provinciaal onderwijs maakt deel uit van het officieel onderwijs. We leven in een diverse maatschappij, eenieder is welkom in het provinciaal onderwijs. We staan voor neutraal, kwaliteitsvol en betaalbaar onderwijs dat snel inspeelt op de uitdagingen van vandaag en morgen.

Onze professionele medewerkers dragen zorg voor de brede persoonlijke ontwikkeling van onze leerlingen in nauwe samenwerking met alle betrokkenen. Wij zetten in op innovatie in een eigentijdse infrastructuur. We werken met moderne leermiddelen en lesmethodes en hebben daarbij bijzondere aandacht voor welzijn, milieu en duurzaamheid.`,
    schoolSpecificText: {},
  },
  {
    id: "1.1",
    title: "Schoolbestuur",
    chapterNumber: 1,
    sectionNumber: "1.1",
    level: 2,
    type: 'text',
    icon: "FileText",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `Het schoolbestuur is de eigenlijke organisator van de school. Ze richt niet alleen het onderwijs in, maar is ook verantwoordelijk voor het beleid. Op deze school is het schoolbestuur de Provincie Oost-Vlaanderen, met de deputatie als uitvoerend orgaan.

Nuttige Adressen:
Het schoolbestuur:
De deputatie van de Provincie Oost-Vlaanderen
Provinciehuis - Charles de Kerchovelaan 189, 9000 Gent
E-mail: info@oost-vlaanderen.be
Website: www.oost-vlaanderen.be`,
    schoolSpecificText: {},
  },
  {
    id: "1.2",
    title: "Schoolpersoneel",
    chapterNumber: 1,
    sectionNumber: "1.2",
    level: 2,
    type: 'text',
    icon: "Users",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `In onze school werken veel mensen samen om jouw opleiding te verzekeren. Sommigen zijn persoonlijk bij je studie betrokken, anderen werken achter de schermen.`,
    schoolSpecificText: {},
  },
  {
    id: "1.2.1",
    title: "Directie",
    chapterNumber: 1,
    sectionNumber: "1.2.1",
    level: 3,
    type: 'text',
    icon: "UserCheck",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: true,
    globalText: `De directeur is het schoolhoofd en staat in voor de dagelijkse leiding van de school. De directeur heeft bijzondere opdrachten op het gebied van toelating, tucht, sancties, evaluaties en deliberaties.`,
    schoolSpecificText: {
      "36467": "Directeur voor Richtpunt campus Eeklo staat paraat om leerlingen te begeleiden naar academisch succes.",
      "145722": "Directeur voor Richtpunt campus Ninove-Zottegem coördineert de campussen Ninove en Zottegem nauwgezet.",
    },
  },
  {
    id: "1.2.2",
    title: "Onderwijzend personeel",
    chapterNumber: 1,
    sectionNumber: "1.2.2",
    level: 3,
    type: 'text',
    icon: "Sparkles",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `De leerkrachten hebben naast het geven van lessen ook andere algemene taken zoals opvoeden, zorgen voor orde, bijwonen van de klassenraden als effectief lid, ... Ze oefenen ook meer specifieke taken uit: zo kunnen ze optreden als klasleerkracht, coördinator, of intern pedagogisch begeleider.`,
    schoolSpecificText: {},
  },
  {
    id: "1.3",
    title: "Klassenraad",
    chapterNumber: 1,
    sectionNumber: "1.3",
    level: 2,
    type: 'text',
    icon: "Folder",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `De klassenraden bestaan minstens uit de directeur of de afgevaardigde, en alle leerkrachten van een bepaald leerjaar. Bij duaal leren zijn ook de trajectbegeleider en mentor van de leerling lid van de klassenraad. In sommige gevallen heeft de klassenraad een advies- of beslissingsbevoegdheid.`,
    schoolSpecificText: {},
  },
  {
    id: "1.4",
    title: "Ouders",
    chapterNumber: 1,
    sectionNumber: "1.4",
    level: 2,
    type: 'text',
    icon: "User",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `In het schoolreglement wordt de term 'ouders' gebruikt om personen aan te duiden die het ouderlijk gezag uitoefenen of personen die de minderjarige leerling in rechte of in feite onder hun bewaring hebben, of de meerderjarige zelf.`,
    schoolSpecificText: {},
  },
  {
    id: "1.5",
    title: "Geldelijke en niet-geldelijke ondersteuning",
    chapterNumber: 1,
    sectionNumber: "1.5",
    level: 2,
    type: 'text',
    icon: "CreditCard",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `De door het schoolbestuur verstrekte leermiddelen of verplichte activiteiten moeten vrij blijven van reclame. Geldelijke en niet-geldelijke ondersteuning moeten verenigbaar zijn met de pedagogische en onderwijskundige taken en doelstellingen van de school.`,
    schoolSpecificText: {},
  },
  {
    id: "1.6",
    title: "Verzekeringen",
    chapterNumber: 1,
    sectionNumber: "1.6",
    level: 2,
    type: 'text',
    icon: "ShieldAlert",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `Je bent gratis verzekerd op school, buiten de school gedurende alle schoolactiviteiten en op weg van en naar de school gedurende de tijd die normaal daarvoor nodig is. Je bent verzekerd tegen lichamelijke verwondingen en letsels. Je bent niet verzekerd tegen diefstal, stoffelijke schade aan kleren, fiets e.d. (uitgezonderd bij schade aan de bril).`,
    schoolSpecificText: {},
  },
  {
    id: "1.7",
    title: "Engagementsverklaring",
    chapterNumber: 1,
    sectionNumber: "1.7",
    level: 2,
    type: 'text',
    icon: "Handshake",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `Ouders hebben hoge verwachtingen van de school omtrent de opleiding en opvoeding van hun kinderen. Onze school zet zich elke dag in om aan deze verwachtingen te voldoen, maar in ruil verwachten we wel de volle steun van je ouders. In bijlage 4 vind je de engagementsverklaring met de wederzijdse afspraken.`,
    schoolSpecificText: {},
  },

  // Chapter 2: Onderwijsaanbod
  {
    id: "2",
    title: "Onderwijsaanbod",
    chapterNumber: 2,
    sectionNumber: "2",
    level: 1,
    type: 'text',
    icon: "Briefcase",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: true,
    globalText: `Richtpunt secundaire scholen bieden een breed scala aan studierichtingen aan in verschillende finaliteitsvormen: doorstroomfinaliteit, dubbele finaliteit, en arbeidsmarktfinaliteit (inclusief duaal leren).`,
    schoolSpecificText: {
      "145722": `In campus Ninove-Zottegem bieden wij de volgende stromen aan:

Eerste graad:
- STEM-wetenschappen (A-stroom)
- STEM-technieken (A-stroom/B-stroom)
- Bouw en Hout / Mechanica en elektriciteit (Pv)

Tweede graad:
- Technologische wetenschappen (doorstroom)
- Mechanische technieken / Elektrotechnieken (dubbele finaliteit)
- Lassen-constructie / Elektrische installaties / Binnenschrijnwerk (arbeidsmarkt)

Derde graad:
- Lassen-monteerder / Autotechnieker / Elektrotechnicus / Interieurbouwer (arbeidsmarkt & duaal leren)
- Beveiligingstechnicus duaal`,
      "36467": `In campus Eeklo ligt de focus onder andere op:
- STEM-technieken
- Houttechnieken & Grafische communicatie
- Verzorging & Organisatie`,
    },
  },

  // Chapter 3: Inschrijving
  {
    id: "3",
    title: "Inschrijving",
    chapterNumber: 3,
    sectionNumber: "3",
    level: 1,
    type: 'text',
    icon: "ClipboardCheck",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `Het Decreet van 25 november 2011 betreffende het inschrijvingsrecht en het Decreet over leersteun van 5 mei 2023 voorzien een procedure die de school moet gebruiken om leerlingen in te schrijven. Een inschrijving is pas gerealiseerd als ze voldoet aan de toelatingsvoorwaarden.`,
    schoolSpecificText: {},
  },
  {
    id: "3.1",
    title: "Taalgebonden maatregelen",
    chapterNumber: 3,
    sectionNumber: "3.1",
    level: 2,
    type: 'text',
    icon: "Languages",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `Stap je voor het eerst in in het voltijds gewoon secundair onderwijs, dan word je gescreend op je niveau van de onderwijstaal (Nederlands) om de nodige maatregelen te kunnen nemen indien specifieke noden zich zouden voordoen. De klassenraad kan u verplichten tot het volgen van maximum drie extra uren Nederlands per week.`,
    schoolSpecificText: {},
  },
  {
    id: "3.2",
    title: "Leerlingen met specifieke onderwijsbehoeften",
    chapterNumber: 3,
    sectionNumber: "3.2",
    level: 2,
    type: 'text',
    icon: "HeartHandshake",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `Ook als je specifieke onderwijsbehoeften hebt, kan je naar een school voor gewoon secundair onderwijs. Je volgt het gemeenschappelijke curriculum (met eventueel een GC-verslag) of een individueel aangepast curriculum (IAC-verslag) of een OV4-verslag.`,
    schoolSpecificText: {},
  },
  {
    id: "3.3",
    title: "Inschrijven in duaal leren",
    chapterNumber: 3,
    sectionNumber: "3.3",
    level: 2,
    type: 'text',
    icon: "Award",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `Duaal leren combineert een component leren op de school met een component werkplekleren. Geschikt voor leerlingen die arbeidsrijp en arbeidsbereid zijn. Er wordt een overeenkomst afgesloten met een onderneming (SAO of OAO).`,
    schoolSpecificText: {},
  },

  // Chapter 4: Privacy
  {
    id: "4",
    title: "Privacy & AVG",
    chapterNumber: 4,
    sectionNumber: "4",
    level: 1,
    type: 'text',
    icon: "Lock",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `De school gaat zorgvuldig om met de privacy van haar leerlingen conform de Algemene Verordening Gegevensbescherming (AVG). Persoonsgegevens worden enkel verwerkt in het kader van de onderwijsopdracht.`,
    schoolSpecificText: {},
  },
  {
    id: "4.3",
    title: "Maken en publiceren van beeldmateriaal",
    chapterNumber: 4,
    sectionNumber: "4.3",
    level: 2,
    type: 'text',
    icon: "Camera",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `De school maakt foto's en video's tijdens schoolactiviteiten. Voor gerichte beelden (bv. portretten of klasfoto's) vragen we expliciete toestemming via het toestemmingsformulier. Niet-gerichte sfeerbeelden kunnen op elk moment gemaakt en gebruikt worden voor schoolcommunicatie.`,
    schoolSpecificText: {},
  },
  {
    id: "4.4",
    title: "Gebruik van artificiële intelligentie (AI)",
    chapterNumber: 4,
    sectionNumber: "4.4",
    level: 2,
    type: 'text',
    icon: "Bot",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `De school kan gebruikmaken van AI in het kader van haar opdrachten (zoals plagiaatcontrole of remediëringstaken). Leerlingen gebruiken AI enkel wanneer dit expliciet is toegelaten door de leerkracht. AI wordt op een veilige, betrouwbare en ethische manier gebruikt, onder menselijk toezicht. Ben je jonger dan 13 jaar? Dan mag je geen gebruik maken van AI. Tussen 13 en 18 jaar is ouderlijke toestemming vereist.`,
    schoolSpecificText: {},
  },
  {
    id: "4.5",
    title: "Monitoringsoftware",
    chapterNumber: 4,
    sectionNumber: "4.5",
    level: 2,
    type: 'text',
    icon: "Eye",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `Als je tijdens de schooltijd gebruik maakt van de computer, kan een personeelslid werken met monitoringsoftware waarmee schermen bekeken of geblokkeerd kunnen worden. Dit heeft uitsluitend een educatief doel en bevordert een efficiënte begeleiding.`,
    schoolSpecificText: {},
  },

  // Chapter 5: Regelmatige leerling
  {
    id: "5",
    title: "Regelmatige leerling",
    chapterNumber: 5,
    sectionNumber: "5",
    level: 1,
    type: 'text',
    icon: "UserCheck",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `Om op het einde van het schooljaar een officieel studiebewijs te behalen, moet je een regelmatige leerling zijn. Dit houdt in dat je voldoet aan de toelatingsvoorwaarden en dat je de volledige vorming werkelijk en regelmatig volgt.`,
    schoolSpecificText: {},
  },

  // Chapter 6: Afspraken en regels
  {
    id: "6",
    title: "Afspraken en regels",
    chapterNumber: 6,
    sectionNumber: "6",
    level: 1,
    type: 'text',
    icon: "ListOrdered",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `Een goed verloop van de schooltijd steunt op afspraken en wederzijds respect tussen leerkrachten, leerlingen, directie en ouders.`,
    schoolSpecificText: {},
  },
  {
    id: "6.1.1",
    title: "Afwezigheid om medische redenen",
    chapterNumber: 6,
    sectionNumber: "6.1.1",
    level: 3,
    type: 'text',
    icon: "Stethoscope",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `Bij afwezigheid wegens medische redenen brengen de ouders de school onmiddellijk op de hoogte. Een medisch attest is verplicht als:
- De ziekte meer dan 3 opeenvolgende kalenderdagen overschrijdt (ook bij verlenging).
- Je dit schooljaar al viermaal een eigen verklaring van de ouders hebt ingediend.
- De afwezigheid valt tijdens examenperiodes.
- Je niet kunt deelnemen aan de lessen lichamelijke opvoeding.`,
    schoolSpecificText: {},
  },
  {
    id: "6.2.1",
    title: "Dagindeling",
    chapterNumber: 6,
    sectionNumber: "6.2.1",
    level: 3,
    type: 'text',
    icon: "Clock",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: true,
    globalText: `Onze reguliere lessen lopen van maandag tot en met vrijdag. De lesuren zijn:
- Voormiddag: 08.25 uur tot 12.00 uur
- Namiddag: 12.50 uur tot 15.35 uur of 16.25 uur.

Woensdagnamiddag is er geen les (vrije namiddag).`,
    schoolSpecificText: {
      "145722": `Op campus Ninove-Zottegem geldt de volgende dagschema:
- 1ste lesuur: 08.25 - 09.15
- 2de lesuur: 09.15 - 10.05
- Pauze: 10.05 - 10.20
- 3de lesuur: 10.20 - 11.10
- 4de lesuur: 11.10 - 12.00
- Middagpauze: 12.00 - 12.50
- 5de lesuur: 12.50 - 13.40
- 6de lesuur: 13.40 - 14.30
- Pauze: 14.30 - 14.45
- 7de lesuur: 14.45 - 15.35
- 8ste lesuur: 15.35 - 16.25

Te laat komen: Je bent ten laatste om 08.20 uur aanwezig op het schooldomein. Als je onterecht 3 keer te laat komt, dien je op de dag zelf na te blijven.`,
    },
  },
  {
    id: "6.4.1",
    title: "ICT-gebruik & Laptops",
    chapterNumber: 6,
    sectionNumber: "6.4.1",
    level: 3,
    type: 'text',
    icon: "Laptop",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `Eigen smartphones of smartwatches zijn niet toegestaan en worden in de eerste graad afgegeven bij binnenkomst. Laptops worden ingezet ten behoeve van het modern digitaal onderwijs.

De school heeft in nauw overleg met directies en ICT-coördinatoren een laptopbeleid uitgewerkt:
- Eerste graad: De school voorziet zelf laptops voor de leerlingen.
- Tweede en Derde graad: Er wordt een leasing- of aankoopformule via The Rent Company (TRC) opgestart:
  * Formule Aankoop: €869,- eenmalig
  * Formule Lease: €19,95 per maand (gedurende 46 maanden, incl. service en reserve-toestel bij schade).
  * Franchise bij accidentele schade bedraagt €50,- per schadegeval.`,
    schoolSpecificText: {},
  },
  {
    id: "6.4.2",
    title: "Taalgebruik op school",
    chapterNumber: 6,
    sectionNumber: "6.4.2",
    level: 3,
    type: 'text',
    icon: "MessageSquareText",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `De leer- en spreektaal op school is het Nederlands. Onze school moedigt iedereen aan om het Nederlands zo correct mogelijk te gebruiken, zowel in de klas als op de speelplaats en tijdens extra-murosactiviteiten. We verwachten een respectvol en verzorgd taalgebruik van eenieder.`,
    schoolSpecificText: {},
  },

  // Chapter 7: Welzijn, veiligheid en gezondheid
  {
    id: "7",
    title: "Welzijn & Veiligheid",
    chapterNumber: 7,
    sectionNumber: "7",
    level: 1,
    type: 'text',
    icon: "Heart",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `Een veilige en gezonde leeromgeving is cruciaal. De school stimuleert een actief preventiebeleid omtrent fysiek en mentaal welbevinden.`,
    schoolSpecificText: {},
  },
  {
    id: "7.1.1",
    title: "Anti-pesten-beleid",
    chapterNumber: 7,
    sectionNumber: "7.1.1",
    level: 3,
    type: 'text',
    icon: "ShieldAlert",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `Op school gaan we met respect met elkaar om. Grensoverschrijdend gedrag, pesten, cyberpesten en verbaal of fysiek geweld worden niet getolereerd. Bij inbreuken zal de directie onmiddellijk en kordaat reageren en gepaste maatregelen of sancties opleggen.`,
    schoolSpecificText: {},
  },
  {
    id: "7.2.1",
    title: "Rookverbod",
    chapterNumber: 7,
    sectionNumber: "7.2.1",
    level: 3,
    type: 'text',
    icon: "FlameKindling",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `Er geldt een strikt en algemeen rookverbod op het volledige schoolterrein, 24 uur op 24, 7 dagen op 7. Dit geldt eveneens binnen een straal van 10 meter rond de in- en uitgangen van de school. Onder roken verstaan we ook de e-sigaret, shishapens en gelijkaardige alternatieven.`,
    schoolSpecificText: {},
  },

  // Chapter 8: Tucht en schendingen
  {
    id: "8",
    title: "Tuchtreglement",
    chapterNumber: 8,
    sectionNumber: "8",
    level: 1,
    type: 'text',
    icon: "Scale",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `Wanneer een leerling de leefregels of tuchtbepalingen ernstig schendt, kunnen bewarende of tuchtrechtelijke maatregelen worden getroffen (zoals tijdelijke uitsluiting of definitieve uitsluiting). Er geldt een strikt omschreven hoorrecht en beroepsprocedure voor de ouders.`,
    schoolSpecificText: {},
  },

  // Chapter 13: Schoolkosten
  {
    id: "13",
    title: "Schoolkosten",
    chapterNumber: 13,
    sectionNumber: "13",
    level: 1,
    type: 'text',
    icon: "Euro",
    isGlobal: true,
    visibleSchools: defaultSchools.map((s) => s.id),
    isSchoolSpecificText: false,
    globalText: `De bijdrageregeling bevat een gedetailleerd overzicht van de gemaakte kosten (zoals turnkledij, werkkoffers, boeken, etc.). Verplichte kosten zijn diegene die onlosmakelijk verbonden zijn aan de studierichting. Er is een actieve afwijkingsregeling voor gezinnen met financiële moeilijkheden en een maximumfactuur voor de eerste graad (€388,08 voor de A-stroom, €258,72 voor de B-stroom).`,
    schoolSpecificText: {},
  },
];

// Helper functions for localStorage persistence
const REGLEMENT_SECTIONS_KEY = "schoolreglement_sections_v1";
const PDF_CONFIG_KEY = "schoolreglement_pdf_v1";
const SCHOOLS_KEY = "schoolreglement_schools_v1";

export function getSavedSchools(): School[] {
  const data = localStorage.getItem(SCHOOLS_KEY);
  if (!data) return defaultSchools;
  try {
    return JSON.parse(data);
  } catch {
    return defaultSchools;
  }
}

export function saveSchools(schools: School[]) {
  localStorage.setItem(SCHOOLS_KEY, JSON.stringify(schools));
}

export function getSavedSections(): RegulationSection[] {
  const data = localStorage.getItem(REGLEMENT_SECTIONS_KEY);
  if (!data) return defaultSections;
  try {
    return JSON.parse(data);
  } catch {
    return defaultSections;
  }
}

export function saveSections(sections: RegulationSection[]) {
  localStorage.setItem(REGLEMENT_SECTIONS_KEY, JSON.stringify(sections));
}

export function getSavedSectionsForVersion(versionId: string): RegulationSection[] {
  if (!versionId) return getSavedSections();
  const key = `${REGLEMENT_SECTIONS_KEY}_version_${versionId}`;
  const data = localStorage.getItem(key);
  if (!data) {
    // If we have some general saved sections, copy that as the starting point!
    const legacyData = localStorage.getItem(REGLEMENT_SECTIONS_KEY);
    if (legacyData) {
      localStorage.setItem(key, legacyData);
      try {
        return JSON.parse(legacyData);
      } catch {
        return defaultSections;
      }
    }
    return defaultSections;
  }
  try {
    return JSON.parse(data);
  } catch {
    return defaultSections;
  }
}

export function saveSectionsForVersion(versionId: string, sections: RegulationSection[]) {
  if (!versionId) {
    saveSections(sections);
    return;
  }
  const key = `${REGLEMENT_SECTIONS_KEY}_version_${versionId}`;
  localStorage.setItem(key, JSON.stringify(sections));
  // Keep the current legacy key updated as well so readers can always fallback sensibly
  localStorage.setItem(REGLEMENT_SECTIONS_KEY, JSON.stringify(sections));
}

export function getSavedPDFConfig(): PDFConfig {
  const data = localStorage.getItem(PDF_CONFIG_KEY);
  if (!data) return defaultPDFConfig;
  try {
    return JSON.parse(data);
  } catch {
    return defaultPDFConfig;
  }
}

export function savePDFConfig(config: PDFConfig) {
  localStorage.setItem(PDF_CONFIG_KEY, JSON.stringify(config));
}

export const lucideNames = [
  "School",
  "FileText",
  "Users",
  "UserCheck",
  "Sparkles",
  "Folder",
  "User",
  "CreditCard",
  "ShieldAlert",
  "Handshake",
  "Briefcase",
  "ClipboardCheck",
  "Languages",
  "HeartHandshake",
  "Award",
  "Lock",
  "Camera",
  "Bot",
  "Eye",
  "ListOrdered",
  "Stethoscope",
  "Clock",
  "Laptop",
  "MessageSquareText",
  "Heart",
  "FlameKindling",
  "Scale",
  "Euro",
  "HelpCircle",
];
