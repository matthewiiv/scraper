// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { AlchemyProvider } from "@ethersproject/providers";
import axios from "axios";
import rateLimit from "axios-rate-limit";
import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import { artifact } from "../../src/ape";

type Data = {
  name: string;
};

type OpenseaAsset = {
  token_id: string;
  permalink: string;
  sell_orders: { base_price: string }[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  async function run(contractFunction: string, collectionSlug: string) {
    const contractAddress = "0x025C6da5BD0e6A5dd1350fda9e3B6a614B205a1F";
    const provider = new AlchemyProvider(
      "mainnet",
      process.env.ALCHEMY_API_KEY
    );

    const contract = new ethers.Contract(contractAddress, artifact, provider);

    async function tokenClaimed(token: string) {
      return await contract[contractFunction](token);
    }

    let aggregatedAssets: OpenseaAsset[] = [];
    let keepGoing = true;
    let cursor = "";
    let count = 0;
    let retries = 0;

    const http = rateLimit(axios.create(), {
      maxRequests: 4,
      perMilliseconds: 1000,
    });

    while (keepGoing && count < 500 && retries < 10) {
      console.log((100 * count) / (10000 / 50) + "%");
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
          //   if (count == 2 || !next) {
          if (!next) {
            keepGoing = false;
          }
          cursor = next || "";
          count++;
        } else {
          console.log("Failing", assets);
        }
      } catch (e) {
        console.log("Retrying");
        retries++;
      }
    }

    const tokens = aggregatedAssets
      .filter((a) => a.sell_orders)
      .flatMap((a) =>
        a.sell_orders.map((o) => ({
          ...o,
          permalink: a.permalink,
          token_id: a.token_id,
        }))
      )
      .flatMap((o) => ({
        price: parseFloat(ethers.utils.formatEther(o.base_price)),
        permalink: o.permalink,
        token_id: o.token_id,
      }))
      .sort((a, b) => a.price - b.price);

    const tokensClaimed = (
      await Promise.all(
        tokens.map(async (token) => ({
          ...token,
          claimed: await tokenClaimed(token.token_id),
        }))
      )
    ).filter((t) => !t.claimed);

    console.log(tokensClaimed);
    return tokensClaimed;
  }

  const apePrice = 20.27;
  const ethPrice = 2291;
  const coinValues = {
    ape: (10094 * apePrice) / ethPrice,
    mutant: (2042 * apePrice) / ethPrice,
    doge: (856 * apePrice) / ethPrice,
  };
  const floorValues = {
    ape: 139,
    mutant: 37,
    doge: 11,
  };
  const apes = (await run("alphaClaimed", "boredapeyachtclub")).filter(
    (d) => d.price > floorValues.ape
  );
  const mutants = (await run("betaClaimed", "mutant-ape-yacht-club")).filter(
    (d) => d.price > floorValues.mutant
  );
  const doges = (await run("gammaClaimed", "bored-ape-kennel-club")).filter(
    (d) => d.price > floorValues.doge
  );
  const bestDoge = doges[0];
  const bestDogeProfit =
    coinValues.doge - (bestDoge.price - floorValues.doge * 0.95);
  const bestMutant = mutants[0];
  const bestMutantProfit =
    coinValues.mutant - (bestMutant.price - floorValues.mutant * 0.95);
  const bestApe = apes[0];
  const bestApeProfit = coinValues.ape - (bestApe.price - floorValues.ape);
  console.log("MUTANT PROFIT (no fees)", bestDogeProfit + bestMutantProfit);
  console.log("CHEAPEST UNCLAIMED MUTANT", bestMutant);
  console.log("APE PROFIT (no fees)", bestDogeProfit + bestApeProfit);
  console.log("CHEAPEST UNCLAIMED APE", bestApe);

  // Save info about apes
  // Make sure you have imahge
  // Get info about eth price and APE price

  res.status(200).json({ name: "John Doe" });
}
