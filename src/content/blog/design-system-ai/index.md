---
title: "Design systems i en AI-assisterad kodbas"
description: "Vad som faktiskt förändras när AI-assistenter skriver koden — och vad det ställer för krav på hur vi definierar komponentbibliotek och designtokens."
pubDate: 2026-06-28
updatedDate: 2026-06-28
tags: ["ai", "design-systems", "arkitektur", "komponenter"]
pillar: "ai-arkitektur"
draft: false
---

Det var en vardag i mars som jag insåg att vår komponentdokumentation hade fel målgrupp.

Vi hade lagt ner månader på att skriva prop-tabeller, visa visuella varianter, dokumentera när man ska använda `ButtonPrimary` kontra `ButtonSecondary`. Dokumentationen var skriven för en mänsklig läsare som skulle förstå intentionen bakom en komponent och sedan fatta ett omdömesgrant beslut.

Problemet: majoriteten av den som läste dokumentationen nu var en LLM.

## Vad ett design system faktiskt är till för

Traditionellt är ett design system tre saker:

1. En visuell specifikation (färger, typografi, spacing)
2. En komponentbibliotek (implementationer av den specifikationen)
3. En konvention (hur de används tillsammans, i vilket sammanhang)

Det tredje är det svåraste att dokumentera och det viktigaste att förstå. Det är den tysta kunskapen om varför vi inte lägger en `Alert` inne i ett `Modal`, eller varför vi föredrar en `Skeleton` framför en `Spinner` i just det flödet.

Den kunskapen förutsätter att läsaren förstår kontext. En erfaren frontend-utvecklare bygger upp den kunskapen gradvis och intuitivt. En AI-assistent har ingen persistent förståelse alls — den börjar om från noll varje request och förstår bara vad du berättar för den just nu.

Det förändrar vad ett design system behöver vara.

## Designtokens som semantiska kontrakt

Tokens — de namngivna variablerna för färg, spacing, typografi — fyller en annan funktion nu.

Förut var de ett praktiskt verktyg: ändra `color-primary` på ett ställe och det slår igenom i hela gränssnittet. Det är fortfarande sant, men det är inte längre det viktigaste.

Det viktigaste är att tokennamnet bär semantisk information som en AI-assistent kan använda för att fatta rätt beslut.

Jämför:

```css
/* Oklart */
--color-blue-500: #2563eb;
--color-blue-600: #1d4ed8;

/* Semantiskt */
--color-action: #2563eb;
--color-action-hover: #1d4ed8;
--color-action-destructive: #dc2626;
```

En assistent som ser `color-blue-500` vet att det är en nyans av blått. En assistent som ser `color-action` vet att det är den färg man använder för interaktiva element. Den skillnaden påverkar varje komponent den bygger.

Vi revideade hela vår token-taxonomi efter den insikten. Det var sex timmars arbete som förändrade kvaliteten på all AI-genererad UI-kod vi producerat sedan dess.

## Komponent-API:er som promptar

En komponent är en prompt till den som ska använda den. Det gäller alltid, men det gäller ännu mer nu.

Ta ett formulärfält:

```typescript
// Version 1 — visuellt orienterat
interface FieldProps {
  label: string;
  value: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Version 2 — semantiskt orienterat  
interface FieldProps {
  label: string;
  value: string;
  validationError?: string;     // Fel som uppstår efter validering
  helpText?: string;            // Kontextuell hjälptext, visas alltid
  isReadOnly?: boolean;         // Fältet visas men kan inte redigeras
  isDisabled?: boolean;         // Fältet är inaktiverat av en systemregel
}
```

Den andra versionen kostar fyra extra rader att dokumentera. Den returnerar en AI-assistent som förstår skillnaden mellan `validationError` och `helpText`, som inte blandar ihop `isReadOnly` med `isDisabled`, som väljer rätt prop i rätt situation.

Multiplicera den skillnaden med ett komponentbibliotek på 80 komponenter.

## Det du inte kan lägga i ett komponentbibliotek

Allt ovan handlar om vad du *kan* formalisera. Men den tysta kunskapen — konventionen, det tredje lagret — är svårare.

Hur dokumenterar man att `Toast`-notifikationer aldrig ska triggas av en bakgrundsprocess om inte användaren initierade den processen? Att vi föredrar optimistisk uppdatering i listan men pessimistisk i detaljer? Att vår `Dialog` alltid ska ha en tydlig escape route — inte bara ett kryss, utan en faktisk anledning att stänga?

Den kunskapen lever i kodereviewer. I kommentarer på pull requests. I postmortems efter UX-problem.

Det vi har börjat göra är att destillera den in i vad vi kallar *kontext-dokument* — korta, opinionerade texter om en specifik del av gränssnittet som går in i prompten när en assistent arbetar med den delen. Inte komponentdokumentation, utan designreasoning i prosaform.

```markdown
# Toast-konventioner

Toasts triggas bara av explicita användarhandlingar.
Bakgrundsprocesser (sync, auto-save) är tysta om de lyckas.
Felmeddelanden från bakgrundsprocesser visas inline, aldrig som Toast.

Anledning: Toast bryter fokus. Användaren befinner sig mitt i en annan uppgift.
Att avbryta den med ett meddelande om något de inte initierade skapar mer 
oro än information.
```

Det är sex rader som eliminerar en hel kategori av fel.

## Vad förändras egentligen

Design systems har alltid handlat om att koda in beslut så att inte varje ny komponent kräver att samma beslut fattas om igen. Det är fortfarande sant.

Det som förändras är att beslutfattaren nu delvis är en AI-assistent som saknar långtidsminne och bygger sin förståelse uteslutande på vad du explicit berättar. Det ställer högre krav på att de besluten är *explicita* — inte underförstådda i konvention, inte inbäddade i "vi brukar göra så här"-kulturen, utan faktiskt skrivna ner på ett sätt som bär semantisk information.

Det är i praktiken en bättre form av design system-dokumentation. Mer precis, mer avsiktlig, mer anpassad till en läsare som inte fyller i luckorna med erfarenhet.

Att AI-assistenten drar nytta av det är en bieffekt. Det som faktiskt händer är att teamet tvingas vara tydligare med sig självt om varför man har gjort de val man gjort.

Det är ett ovanligt fall där en verktygsförändring driver en kulturförändring i rätt riktning.
