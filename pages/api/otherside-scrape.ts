// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { AlchemyProvider } from "@ethersproject/providers";
import axios from "axios";
import rateLimit from "axios-rate-limit";
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import getAbi from "../../src/etherscan/get-abi";

type Data = any;
//{
//   name: string;
// };

type OpenseaOrder = {
  base_price: string;
  sale_kind: 1 | 0;
  side: 1 | 0;
  taker?: { address: string };
  maker?: { address: string };
};

type OpenseaAsset = {
  token_id: string;
  permalink: string;
  image_thumbnail_url: string;
  owner?: { address: string };
  sell_orders?: OpenseaOrder[];
};

type AssetWithMainOrder = OpenseaAsset & { main_order?: OpenseaOrder };

export type AssetWithClaimData = AssetWithMainOrder & {
  claimed: any;
  price: number | undefined;
  token_id: string;
  permalink: string;
};

export type OpenseaCollectionStats = {
  floor_price: number;
};

async function getCollectionStats(collectionSlug: string) {
  const url = `https://api.opensea.io/api/v1/collection/${collectionSlug}/stats`;

  const http = rateLimit(axios.create(), {
    maxRequests: 4,
    perMilliseconds: 1000,
  });

  const response = await http.get<{
    stats: OpenseaCollectionStats;
    next?: string;
  }>(url, {
    headers: { "X-API-KEY": process.env.OPENSEA_API_KEY || "" },
  });

  const { stats } = response.data;
  return stats;
}

async function getListings(
  collectionSlug: string
): Promise<AssetWithMainOrder[] | undefined> {
  let aggregatedAssets: OpenseaAsset[] = [];
  let cursor = "";
  let count = 0;
  let retries = 0;

  const http = rateLimit(axios.create(), {
    maxRequests: 4,
    perMilliseconds: 1000,
  });

  while (retries < 10) {
    console.log(`Fetched ${count * 50} ${collectionSlug}`);
    try {
      const url =
        "https://api.opensea.io/api/v1/assets?" +
        new URLSearchParams({
          collection_slug: collectionSlug,
          limit: "50",
          include_orders: "true",
          ...(cursor ? { cursor } : {}),
        });

      const response = await http.get<{
        assets: OpenseaAsset[];
        next?: string;
      }>(url, {
        headers: { "X-API-KEY": process.env.OPENSEA_API_KEY || "" },
      });

      const { assets, next } = response.data;
      if (assets) {
        aggregatedAssets = [...aggregatedAssets, ...assets];
        if (!next || count === 50) {
          return aggregatedAssets
            .map((asset) => ({
              ...asset,
              main_order: asset.sell_orders?.filter(
                (order) =>
                  order.sale_kind === 0 &&
                  order.side === 1 &&
                  order.taker?.address ===
                    "0x0000000000000000000000000000000000000000" &&
                  order.maker?.address === asset.owner?.address
              )[0],
            }))
            .filter((a) => a.main_order);
        }
        cursor = next;
        count++;
      } else {
        console.log("Couldn't fetch assets", assets);
      }
    } catch (e: any) {
      console.log("Retrying", e);
      retries++;
    }
  }
}

async function updateClaimedStatus(
  assets: AssetWithMainOrder[],
  contractFunction: string
): Promise<AssetWithClaimData[]> {
  const contractAddress = "0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258";
  const provider = new AlchemyProvider("mainnet", process.env.ALCHEMY_API_KEY);
  const abi = await getAbi(contractAddress);

  const contract = new ethers.Contract(contractAddress, abi, provider);

  async function tokenClaimed(token: string) {
    try {
      return await contract[contractFunction](token);
    } catch (e) {
      return;
    }
  }

  const tokens = assets
    .map((a) => ({
      ...a,
      price: a.main_order
        ? parseFloat(ethers.utils.formatEther(a.main_order.base_price))
        : undefined,
    }))
    .filter((a) => a.price)
    .sort((a, b) => (a.price || 0) - (b.price || 0));

  const tokensClaimed = (
    await Promise.all(
      tokens.map(async (token) => ({
        ...token,
        claimed: await tokenClaimed(token.token_id),
      }))
    )
  ).filter((t) => !t.claimed);

  return tokensClaimed;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const mutantStats = await getCollectionStats("mutant-ape-yacht-club");
  const mutants = await getListings("mutant-ape-yacht-club");
  const mutantsNotClaimed = mutants
    ? await updateClaimedStatus(mutants, "betaClaimed")
    : null;

  const apeStats = await getCollectionStats("boredapeyachtclub");
  const apes = await getListings("boredapeyachtclub");
  const apesNotClaimed = apes
    ? await updateClaimedStatus(apes, "alphaClaimed")
    : null;
  // Poll api to update listings
  // Check claimed status for each token
  // Save to Mongo
  // Stream to FE

  res
    .status(200)
    .json({ mutantStats, mutantsNotClaimed, apeStats, apesNotClaimed });
}
