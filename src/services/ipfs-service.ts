// src/services/ipfs-service.ts

export async function uploadImageToIPFS(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`Image upload failed: ${res.statusText}`)
  }

  const { cid } = await res.json()
  return `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${cid}`
}

export interface MetadataPayload {
  name: string
  symbol: string
  description: string
  image: string
  creator?: string
  website?: string
  twitter?: string
  telegram?: string
  discord?: string
}

export async function uploadMetadataToIPFS(
  payload: MetadataPayload
): Promise<string> {
  // Construct the metadata object with conditional fields
  const metadata: any = {
    name: payload.name,
    symbol: payload.symbol,
    description: payload.description,
    image: payload.image,
  }
  
  // Add creator if provided
  if (payload.creator) {
    metadata.creator = payload.creator
  }
  
  // Add social links if provided
  if (payload.website) metadata.website = payload.website
  if (payload.twitter) metadata.twitter = payload.twitter
  if (payload.telegram) metadata.telegram = payload.telegram
  if (payload.discord) metadata.discord = payload.discord
  
  // Add attributes section
  metadata.attributes = [
    {
      trait_type: "Platform",
      value: "SolMinter"
    }
  ]

  const res = await fetch('/api/upload-metadata', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata),
  })

  if (!res.ok) {
    throw new Error(`Metadata upload failed: ${res.statusText}`)
  }

  const { cid } = await res.json()
  return `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${cid}`
}