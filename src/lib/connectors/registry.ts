import { BaseSourceConnector } from './base';
import { CertInConnector } from './certin';
import { RbiConnector, SebiConnector, NpciConnector, IrdaiConnector } from './shells';

export class SourceConnectorRegistry {
  private static instance: SourceConnectorRegistry;
  private connectors: Map<string, BaseSourceConnector> = new Map();

  private constructor() {
    this.register(new CertInConnector());
    this.register(new RbiConnector());
    this.register(new SebiConnector());
    this.register(new NpciConnector());
    this.register(new IrdaiConnector());
  }

  public static getInstance(): SourceConnectorRegistry {
    if (!SourceConnectorRegistry.instance) {
      SourceConnectorRegistry.instance = new SourceConnectorRegistry();
    }
    return SourceConnectorRegistry.instance;
  }

  public register(connector: BaseSourceConnector): void {
    this.connectors.set(connector.regulatorShortName.toUpperCase(), connector);
  }

  public getConnector(regulatorShortName: string): BaseSourceConnector | undefined {
    return this.connectors.get(regulatorShortName.toUpperCase());
  }

  public getAllConnectors(): BaseSourceConnector[] {
    return Array.from(this.connectors.values());
  }
}

export const connectorRegistry = SourceConnectorRegistry.getInstance();
