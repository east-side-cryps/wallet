import { SessionTypes } from "@walletconnect/types";

export interface ChainRequestRender {
  label: string;
  value: string;
}

export interface ChainMetadata {
  name: string;
  logo: string;
  rgb: string;
}

export interface NamespaceMetadata {
  [reference: string]: ChainMetadata;
}

export declare namespace Step {
  export interface Default {
    type: "default";
    data: any;
  }

  export interface Proposal {
    type: "proposal";
    data: { proposal: SessionTypes.Proposal };
  }

  export interface Session {
    type: "session";
    data: { session: SessionTypes.Created };
  }

  export interface Request {
    type: "request";
    data: { requestEvent: SessionTypes.RequestEvent; peer: SessionTypes.Peer };
  }

  export type All = Default | Proposal | Session | Request;
}
