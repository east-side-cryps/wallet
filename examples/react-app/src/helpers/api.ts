import axios, { AxiosInstance } from "axios";
import { AssetData, GasPrices, ParsedTx } from "./types";

// TODO: use Dora to get Neo public information, but maybe we don't need this for the prototype

const api: AxiosInstance = axios.create({
  baseURL: "https://",
  timeout: 30000, // 30 secs
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export async function apiGetAccountAssets(address: string): Promise<AssetData[]> {
  const response = await api.get(`/account-assets?address=${address}`);
  const { result } = response.data;
  return result;
}

export async function apiGetAccountTransactions(
  address: string,
  chainId: string,
): Promise<ParsedTx[]> {
  const ethChainId = chainId.split(":")[1];
  const response = await api.get(`/account-transactions?address=${address}&chainId=${ethChainId}`);
  const { result } = response.data;
  return result;
}

export const apiGetAccountNonce = async (address: string, chainId: string): Promise<number> => {
  const ethChainId = chainId.split(":")[1];
  const response = await api.get(`/account-nonce?address=${address}&chainId=${ethChainId}`);
  const { result } = response.data;
  return result;
};

export const apiGetGasPrices = async (): Promise<GasPrices> => {
  const response = await api.get(`/gas-prices`);
  const { result } = response.data;
  return result;
};
