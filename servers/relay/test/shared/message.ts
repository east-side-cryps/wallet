import { RELAY_JSONRPC, RelayJsonRpc } from "relay-provider";
import { formatJsonRpcRequest, JsonRpcRequest } from "@json-rpc-tools/utils";

import { LegacySocketMessage } from "../../src/types";
import { generateRandomBytes32 } from "../../src/utils";

import { TEST_MESSAGE } from "./values";

export interface TestJsonRpcPayloads {
  pub: JsonRpcRequest<RelayJsonRpc.PublishParams>;
  sub: JsonRpcRequest<RelayJsonRpc.SubscribeParams>;
}

export function getTestJsonRpc(message = TEST_MESSAGE): TestJsonRpcPayloads {
  const topic = generateRandomBytes32();

  const pub = formatJsonRpcRequest<RelayJsonRpc.PublishParams>(RELAY_JSONRPC.bridge.publish, {
    topic,
    message,
    ttl: 86400,
  });

  const sub = formatJsonRpcRequest<RelayJsonRpc.SubscribeParams>(RELAY_JSONRPC.bridge.subscribe, {
    topic,
  });
  return { pub, sub };
}

export interface TestLegacyPayloads {
  pub: LegacySocketMessage;
  sub: LegacySocketMessage;
}

export function getTestLegacy(payload = TEST_MESSAGE): TestLegacyPayloads {
  const topic = generateRandomBytes32();

  const pub: LegacySocketMessage = {
    topic,
    type: "pub",
    payload,
    silent: true,
  };

  const sub: LegacySocketMessage = {
    topic,
    type: "sub",
    payload: "",
    silent: true,
  };

  return { pub, sub };
}