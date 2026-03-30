<h1 align="center">
  <a href="https://mimic.fi">
    <img src="https://www.mimic.fi/logo.png" alt="Mimic Protocol" width="200">
  </a>
</h1>

<h4 align="center">Blockchain developer platform</h4>

<p align="center">
  <a href="https://discord.mimic.fi">
    <img src="https://img.shields.io/badge/discord-join-blue" alt="Discord">
  </a>
</p>

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#scope">Scope</a> •
  <a href="#setup">Setup</a> •
  <a href="#license">License</a>
</p>

---

## Overview

In this example, a Dollar Cost Averaging (DCA) strategy is defined to automatically purchase a target asset when certain conditions are met. The execution is triggered based on a configured USD threshold, allowing users to accumulate assets over time in a disciplined and automated way.

The application defines:

Target asset to acquire (e.g. ETH, BTC, etc.)
Payment configuration (token, chain, and amount to spend)
USD threshold condition to trigger the purchase

The application does not implement:

Automation scheduling or trigger execution
Price monitoring or oracle integrations
Cross-chain execution flows
Token swaps across arbitrary pairs
Bridging or cross-chain transfers
Transaction execution routing
Execution retries and failure handling
Gas management or native token funding
RPC connections

Mimic handles execution by abstracting:

USD-based trigger conditions for DCA execution
Price monitoring and oracle integrations
Token swaps required to acquire the target asset
Cross-chain routing when needed
Transaction execution, retries, and failure handling
Gas payment and transaction submission

This allows developers to focus on defining DCA strategies and user preferences while delegating execution complexity to Mimic.

## Scope

This example uses Ethereum as the reference chain.

Mimic supports execution across multiple chains, including cross-chain payment flows. The same subscription model applies to other supported networks.

## Setup

To set up this project you'll need [git](https://git-scm.com) and [yarn](https://classic.yarnpkg.com) installed.

From your command line:

```bash
# Clone the repository
git clone https://github.com/mimic-fi/dca-with-mimic.git

# Enter the repository
cd dca-with-mimic

# Install dependencies
yarn
```

## License

MIT

---

> Website [mimic.fi](https://mimic.fi) &nbsp;&middot;&nbsp;
> Docs [docs.mimic.fi](https://docs.mimic.fi) &nbsp;&middot;&nbsp;
> GitHub [@mimic-fi](https://github.com/mimic-fi) &nbsp;&middot;&nbsp;
> Twitter [@mimicfi](https://twitter.com/mimicfi) &nbsp;&middot;&nbsp;
> Discord [mimic](https://discord.mimic.fi)
