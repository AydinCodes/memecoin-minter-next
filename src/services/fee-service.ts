// src/services/fee-service.ts

export interface FeeOptions {
  revokeMint: boolean
  revokeFreeze: boolean
  revokeUpdate: boolean
  socialLinks: boolean
  creatorInfo: boolean
}

export function calculateFee(options: FeeOptions): number {
  let fee = 0.2 // base fee

  if (options.revokeMint)    fee += 0.1
  if (options.revokeFreeze)  fee += 0.1
  if (options.revokeUpdate)  fee += 0.1
  if (options.socialLinks)   fee += 0.1
  if (options.creatorInfo)   fee += 0.1

  return Math.min(fee, 0.3) // cap at 0.3 SOL
}
