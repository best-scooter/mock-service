# mock-service

För att mocka scootrar och kunder och deras rörelser.

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
