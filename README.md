<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Schoolreglementen – Provinciaal Onderwijs Oost-Vlaanderen

Productiepublicatie via Cloudflare Pages: https://schoolreglement-poov.pages.dev

De productiebranch is `main`; pushes naar `main` activeren de automatische Cloudflare Pages-deployment.

## Lokale ontwikkeling

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/272a2ccb-608f-4093-a099-4d76197a63a3

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Beveiliging en single sign-on

- De applicatie gebruikt Cloudflare Access als identiteitsbron.
- `/api/session` valideert de Cloudflare Access-JWT op handtekening, issuer, audience en vervaldatum.
- Voor Firebase wordt een kortlevend custom token aangemaakt door `/api/firebase-token`.
- De serviceaccount-private key staat uitsluitend in de Cloudflare Pages-secret `FIREBASE_SERVICE_ACCOUNT_JSON`; plaats deze nooit in GitHub-broncode of in de chat.
- De Firestore-regels laten openbare raadpleging toe, maar schrijven uitsluitend toe aan het geverifieerde superbeheeraccount `arne.nys@ptiz.be`.

### Eenmalige Cloudflare-configuratie

Voeg in Cloudflare Pages bij **Settings → Variables and Secrets → Production** een secret toe:

- Naam: `FIREBASE_SERVICE_ACCOUNT_JSON`
- Waarde: de volledige JSON-sleutel van een serviceaccount uit Google Cloud-project `gen-lang-client-0743659608`

Het serviceaccount moet de Firestore Rules Admin-rol hebben om de regels via de build te publiceren. De Firebase Authentication-service moet in het project geactiveerd zijn. Na het toevoegen van het secret triggert een nieuwe push naar `main` automatisch de publicatie van de Firestore-regels; de app gebruikt hetzelfde secret om de Firebase-sessie op te bouwen.

Zonder dit secret blijven de nieuwe Firestore-regels alleen voorbereid in de repository en wordt de Firebase-aanmelding niet geactiveerd. De build slaat de rules-deploy dan bewust over.


## Beheerrechten voor de D1-API

De schrijfroute `/api/data` vertrouwt uitsluitend op een geldig Cloudflare Access-JWT en een expliciete e-mailallowlist. Configureer in Cloudflare Pages bij **Settings → Variables and Secrets**:

- `ADMIN_EMAILS`: komma-gescheiden lijst van beheerders-e-mailadressen, bijvoorbeeld `beheerder1@school.be,beheerder2@school.be`.

Als de variabele ontbreekt, blijft uit compatibiliteit alleen het bestaande beheeraccount `arne.nys@ptiz.be` toegelaten. Voeg nieuwe beheerders pas toe nadat hun identiteit en Cloudflare Access-toegang zijn gecontroleerd. Gebruik geen client-side rolveld om beheerdersrechten toe te kennen.

Na configuratie moet de API met een niet-beheerder (403), zonder Access-token (401) en met elke toegelaten beheerder (200 bij geldige payload) worden getest.
