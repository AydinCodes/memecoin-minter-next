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
  website?: string
  twitter?: string
  telegram?: string
  discord?: string
}

export async function uploadMetadataToIPFS(
  payload: MetadataPayload
): Promise<string> {
  const res = await fetch('/api/upload-metadata', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error(`Metadata upload failed: ${res.statusText}`)
  }

  const { cid } = await res.json()
  return `https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/ipfs/${cid}`
}
