# ws-server

WebSocket-server för bestscooter.

Det finns två huvudsakliga flöden att använda sig av till servern. Båda kräver att klienten verifierar en token som är hämtad från api-servern.

Det första flödet handlar om att skicka uppdateringar till WebSocket-servern för att ge systemet information om resurserna.

Det andra flödet är till för att admins och kunder ska kunna abonnera på information som de behöver för sin användning av systemet, huvudsakligen för att få en karta som uppdateras i realtid.

## Available Scripts

### `npm run dev`

Kör servern i development mode.

### `npm test`

Kör all enhetstester med hot-reloading.

### `npm test -- --testFile="name of test file" (i.e. --testFile=Users).`

Kör ett enskild enhetstest.

### `npm run test:no-reloading`

Kör alla tester utan hot-reloading.

### `npm run lint`

Kör lintern.

### `npm run build`

Bygg projektet för production.

### `npm start`

Kör production-builden (måste vara byggt först).

### `npm start -- --env="name of env file" (default is production).`

Kör production-builden med en annan .env-fil.

### `npm run docker:build`

Bygger appen och bygger imagen.

### `npm run docker:push`

Pushar imagen till ACR.

## API-referens

- [Skicka uppdateringar från klient](#skicka-uppdateringar-från-klient)
  - [IN customer](#%EF%B8%8F-in-customer)
  - [IN scooter](#%EF%B8%8F-in-scooter)
  - [IN tripStart](#%EF%B8%8F-in-tripstart)
  - [IN tripEnd](#%EF%B8%8F-in-tripend)
  - [IN trip](#%EF%B8%8F-in-trip)
- [Abonnera på uppdateringar från servern](#abonnera-på-uppdateringar-från-servern)
  - [IN subscribe](#%EF%B8%8F-in-subscribe)
  - [UT scooter](#%EF%B8%8F-ut-scooter)
  - [UT customer](#%EF%B8%8F-ut-customer)
  - [UT trip](#%EF%B8%8F-ut-trip)

## Skicka uppdateringar från klient

### ⬅️ IN customer

```typescript
{
    message: "customer",
    customerId: number,
    positionX: number,
    positionY: number
}
```

### ⬅️ IN scooter

```typescript
{
    message: "scooter",
    scooterId: number,
    positionX?: number,
    positionY?: number,
    battery?: number,
    charging?: boolean,
    available?: boolean,
    decomissioned?: boolean,
    beingServiced?: boolean,
    disabled?: boolean
}
```

### ⬅️ IN tripStart

```typescript
{
    message: "tripStart",
    customerId: number,
    scooterId: number
}
```

### ⬅️ IN tripEnd

```typescript
{
    message: "tripEnd",
    tripId: number
}
```

### ⬅️ IN trip

`routeAppend` lägger till nya punkter till resans rutt, `route` ersätter hela resans rutt.

> [!WARNING]
> Använd inte `routeAppend` och `route` i samma PUT, det kan få oförutsedda resultat.


```typescript
{
    message: "trip",
    tripId: number,
    distance?: number,
    route?: [number, number][],
    routeAppend?: [number, number][],
    parkedCharging?: boolean
}
```

## Abonnera på uppdateringar från servern

### ⬅️ IN subscribe

Ange vilken information du vill abonnera i `subscriptions`. Giltiga alternativ är:

- `"scooterLimited"`
- `"scooter"`
- `"customer"`
- `"trip"`

Kunder bör bara ha tillgång till att se tillgängliga elsparkcyklar på kartan, då finns scooterLimited som bara ger begränsad information om elsparkcyklar.

```typescript
{
    message: "subscribe",
    subscriptions: string[]
}
```

### ➡️ UT scooter

#### scooterLimited

Detta abonnemang är till för kundernas karta och ska bara visa cyklar som är parkerade, tillgängliga och har batterinivå över 50%.

```typescript
{
    message: "scooter",
    scooterId: number,
    positionX?: number,
    positionY?: number,
    battery?: number,
    remove?: boolean
}
```

#### scooter

```typescript
{
    message: "scooter",
    scooterId: number,
    positionX?: number,
    positionY?: number,
    battery?: number,
    charging?: boolean,
    available?: boolean,
    decomissioned?: boolean,
    beingServiced?: boolean,
    disabled?: boolean,
    connected?: boolean,
    remove?: boolean
}
```

### ➡️ UT customer

```typescript
{
    message: "customer",
    customerId: number,
    positionX?: number,
    positionY?: number,
    remove?: boolean
}
```

### ➡️ UT trip


```typescript
{
    message: "trip",
    scooterId: number,
    customerId: number,
    tripId: number,
    timeStarted?: string,
    timeEnded?: string,
    distance?: number,
    route?: [number, number][]
}
```
# mock-service
