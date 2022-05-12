import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  AssetWithClaimData,
  OpenseaCollectionStats,
} from "./api/otherside-scrape";

const Home: NextPage = () => {
  const [mutantStats, setMutantStats] = useState<OpenseaCollectionStats>();
  const [mutants, setMutants] = useState<AssetWithClaimData[]>();
  const [apeStats, setApeStats] = useState<OpenseaCollectionStats>();
  const [apes, setApes] = useState<AssetWithClaimData[]>();
  useEffect(() => {
    async function getData() {
      const response = await fetch("/api/otherside-scrape");
      const { mutantStats, mutantsNotClaimed, apeStats, apesNotClaimed } =
        (await response.json()) as {
          mutantStats: OpenseaCollectionStats;
          mutantsNotClaimed: AssetWithClaimData[];
          apeStats: OpenseaCollectionStats;
          apesNotClaimed: AssetWithClaimData[];
        };
      setMutantStats(mutantStats);
      setMutants(mutantsNotClaimed);
      setApeStats(apeStats);
      setApes(apesNotClaimed);
      console.log(mutantsNotClaimed);
    }
    getData();
  }, []);

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="flex">
          <div>
            {mutants?.map((m) => (
              <div key={m.token_id}>
                <div className="relative">
                  <Image
                    src={m.image_thumbnail_url}
                    layout={"fixed"}
                    width={150}
                    height={150}
                  />
                </div>
                <p>Floor {mutantStats?.floor_price}</p>
                <p>Price {m.price}</p>
                <p>
                  Difference {(m.price || 0) - (mutantStats?.floor_price || 0)}
                </p>
                <a href={m.permalink} target="_blank" rel="noreferrer">
                  Link
                </a>
              </div>
            ))}
          </div>{" "}
          <div>
            {apes?.map((a) => (
              <div key={a.token_id}>
                <div className="relative">
                  <Image
                    src={a.image_thumbnail_url}
                    layout={"fixed"}
                    width={150}
                    height={150}
                  />
                </div>
                <p>Floor {apeStats?.floor_price}</p>
                <p>Price {a.price}</p>
                <p>
                  Difference {(a.price || 0) - (apeStats?.floor_price || 0)}
                </p>
                <a href={a.permalink} target="_blank" rel="noreferrer">
                  Link
                </a>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
