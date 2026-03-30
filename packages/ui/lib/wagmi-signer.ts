import { Address, Signature, Signer, TypedDataDomain, TypedDataTypes } from '@mimicprotocol/sdk'
import { Config } from '@wagmi/core'
import { signMessage, signTypedData } from '@wagmi/core/actions'
import { ethers } from 'ethers'

export class WagmiSigner implements Signer {
  constructor(
    public readonly address: Address,
    private readonly config: Config
  ) {}

  getAddress(): Promise<Address> {
    return Promise.resolve(this.address)
  }

  signMessage(message: string): Promise<Signature> {
    return signMessage(this.config, { account: this.address as `0x${string}`, message })
  }

  signTypedData(domain: TypedDataDomain, types: TypedDataTypes, value: Record<string, unknown>): Promise<Signature> {
    return signTypedData(this.config, {
      account: this.address as `0x${string}`,
      domain: {
        chainId: domain.chainId,
        name: domain.name,
        salt: domain.salt as `0x${string}` | undefined,
        verifyingContract: domain.verifyingContract as `0x${string}` | undefined,
        version: domain.version,
      },
      types,
      message: value,
      primaryType: 'Trigger',
    })
  }

  verifyMessage(message: string, signature: Signature): Address {
    return ethers.verifyMessage(message, signature)
  }

  verifyTypedData(
    domain: TypedDataDomain,
    types: TypedDataTypes,
    value: Record<string, unknown>,
    signature: Signature
  ): Address {
    return ethers.verifyTypedData(domain, types, value, signature)
  }
}
