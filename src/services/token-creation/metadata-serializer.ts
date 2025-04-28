// src/services/token-creation/metadata-serializer.ts
// Handles serialization of token metadata for on-chain storage

import { PublicKey } from "@solana/web3.js";
import { TokenMetadataParams, TokenCreator, TokenCollection } from "./token-types";

/**
 * Serializes a UTF-8 string with u32-length prefix (LE)
 */
export function serializeString(value: string): Uint8Array {
  const buffer = Buffer.from(value, "utf8");
  const length = Buffer.alloc(4);
  length.writeUInt32LE(buffer.length, 0);
  return Buffer.concat([length, buffer]);
}

/**
 * Serializes metadata for Metaplex createMetadataAccountV3 instruction
 */
export function serializeMetadataV3(data: TokenMetadataParams): Uint8Array {
  // Serialize name, symbol, and URI
  const nameBuffer = serializeString(data.name);
  const symbolBuffer = serializeString(data.symbol);
  const uriBuffer = serializeString(data.uri);
  
  // Serialize seller fee basis points (u16)
  const sellerFeeBasisPointsBuffer = Buffer.alloc(2);
  sellerFeeBasisPointsBuffer.writeUInt16LE(data.sellerFeeBasisPoints, 0);

  // Serialize creators (Option<Vec<Creator>>)
  let creatorsBuffer;
  if (data.creators === null) {
    creatorsBuffer = Buffer.from([0]); // None
  } else {
    const creatorsVec = Buffer.concat(
      data.creators.map((creator) => {
        const address = creator.address.toBuffer();
        const verified = Buffer.from([creator.verified ? 1 : 0]);
        const share = Buffer.from([creator.share]);
        return Buffer.concat([address, verified, share]);
      })
    );

    const creatorsLength = Buffer.alloc(4);
    creatorsLength.writeUInt32LE(data.creators.length, 0);

    creatorsBuffer = Buffer.concat([
      Buffer.from([1]), // Some
      creatorsLength,
      creatorsVec,
    ]);
  }

  // Serialize collection (Option<Collection>)
  let collectionBuffer;
  if (data.collection === null) {
    collectionBuffer = Buffer.from([0]); // None
  } else {
    collectionBuffer = Buffer.concat([
      Buffer.from([1]), // Some
      new PublicKey(data.collection.key).toBuffer(),
      Buffer.from([data.collection.verified ? 1 : 0]),
    ]);
  }

  // Serialize uses (Option<Uses>) - not used so set to None
  const usesBuffer = Buffer.from([0]);

  // Serialize collection details (Option<CollectionDetails>) - not used so set to None
  const collectionDetailsBuffer = Buffer.from([0]);

  // Serialize isMutable
  const isMutableBuffer = Buffer.from([data.isMutable ? 1 : 0]);

  // Combine all serialized components
  return Buffer.concat([
    nameBuffer,
    symbolBuffer,
    uriBuffer,
    sellerFeeBasisPointsBuffer,
    creatorsBuffer,
    collectionBuffer,
    usesBuffer,
    collectionDetailsBuffer,
    isMutableBuffer,
  ]);
}