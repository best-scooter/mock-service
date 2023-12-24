import Client from "./Client";

interface Strategy {
    client: Client;
    initiate(): void;
}

export default Strategy;