import { PairingTypes, SignalTypes } from "@walletconnect/types";
import { THIRTY_DAYS } from "./time";

export const PAIRING_JSONRPC = {
  approve: "wc_pairingApprove",
  reject: "wc_pairingReject",
  update: "wc_pairingUpdate",
  upgrade: "wc_pairingUpgrade",
  delete: "wc_pairingDelete",
  payload: "wc_pairingPayload",
  ping: "wc_pairingPing",
};

export const PAIRING_CONTEXT = "pairing";

export const PAIRING_DEFAULT_TTL = THIRTY_DAYS;

export const PAIRING_SIGNAL_METHOD_URI = "uri" as SignalTypes.MethodUri;

export const PAIRING_STATUS = {
  proposed: "proposed" as PairingTypes.ProposedStatus,
  responded: "responded" as PairingTypes.RespondedStatus,
  pending: "pending",
  settled: "settled",
};

export const PAIRING_EVENTS = {
  proposed: "pairing_proposed",
  responded: "pairing_responded",
  settled: "pairing_settled",
  updated: "pairing_updated",
  deleted: "pairing_deleted",
  request: "pairing_request",
  response: "pairing_response",
};

export const PAIRING_REASONS = {
  settled: { code: 1000, message: "Pairing settled" },
  not_approved: { code: 1001, message: "Pairing not approved" },
  responded: { code: 1002, message: "Pairing proposal responded" },
  acknowledged: { code: 1003, message: "Pairing response acknowledged" },
};
