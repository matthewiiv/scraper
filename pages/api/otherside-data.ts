// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { MongoClient } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = any;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const mongoClient = new MongoClient(
    `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.ulnom.mongodb.net/${process.env.MONGO_ORGANISATION}?retryWrites=true&w=majority`
  );
  try {
    await mongoClient.connect();
    const mutantCollection = await mongoClient
      .db()
      .collection("opensea-collections")
      .findOne({ collection_slug: "mutant-ape-yacht-club" });
    const boredApeCollection = await mongoClient
      .db()
      .collection("opensea-collections")
      .findOne({ collection_slug: "boredapeyachtclub" });
    const mutantsNotClaimed = await mongoClient
      .db()
      .collection("opensea-assets")
      .findOne({ collection_slug: "mutant-ape-yacht-club" });
    const boredApesNotClaimed = await mongoClient
      .db()
      .collection("opensea-assets")
      .findOne({ collection_slug: "boredapeyachtclub" });

    await mongoClient.close();
    res.status(200).json({
      mutantCollection,
      boredApeCollection,
      mutantsNotClaimed: mutantsNotClaimed?.listed_assets,
      boredApesNotClaimed: boredApesNotClaimed?.listed_assets,
    });
  } catch (e) {
    await mongoClient.close();
    res.status(500);
  }
}
