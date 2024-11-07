![Feeelii Landing Preview](https://utfs.io/f/XoQ2oTl97RNoXUHz4kl97RNo1MiU54ZpKquvFkOjJHL6tdIf)

# Freelii
Freelii is a modern platform designed to make secure cross-border payments and asset transfers effortless using the Stellar blockchain. It provides a smooth, intuitive experience for both on-chain and off-chain transactions, ideal for freelancers, remote workers, and anyone needing simple, efficient financial solutions.

Our primary goal is to deliver cross-border payment rails for non-crypto users, eliminating as much industry jargon as possible—even common terms like OTP or KYC are minimized. We focused on creating an experience that feels as familiar and straightforward as sending a text message, allowing users to access financial tools without complexity or barriers.
## Features
- Cross-Border Payments: Transfer assets across different currencies and locations using Stellar's SEP standards.
- Chatbot Integration: Accessible via [FreeliiBot](https://t.me/Freelibot) on Telegram, allowing users to interact with the platform directly from their messaging app.
- Automated Currency Exchange: Supports Stellar assets and off-chain currency conversion, allowing users to transact seamlessly between different assets.

## Demo

### Sending money abroad, as easy as texting
Freelii enables quick and secure international payments, even to cash pickup locations. Check out the Freelii demo [video](https://youtu.be/fxNvhjP5Ozg) for a walkthrough of a regular transaction from start to finish.

[![Watch the video](https://img.youtube.com/vi/fxNvhjP5Ozg/maxresdefault.jpg)](https://youtu.be/fxNvhjP5Ozg)

### Receive Payments Globally, Redeem Locally
Freelii enables users to receive payments and remittances from clients, family or friends worldwide, allowing them to redeem funds directly in their local currency or transfer them to their bank account

[![Watch the video](https://img.youtube.com/vi/ghgaZ4F2T2Q/maxresdefault.jpg)](https://youtu.be/ghgaZ4F2T2Q)


## Getting Started

To get started, simply interact with [FreeliiBot on Telegram](https://t.me/FreeliiBot) or use the [Freelii Web Platform](https://freelii.vercel.app/)
- Telegram Bot: Start a chat with the bot and follow instructions to create an account and access platform features: [FreeliiBot on Telegram](https://t.me/FreeliiBot)
- Web Platform: Access the full platform here: [Freelii Web Platform](https://freelii.vercel.app/)

## How It Works

Freelii leverages the Stellar blockchain to provide a secure, efficient solution for cross-border payments and asset transfers.

- SEP Protocols: Using Stellar's SEP standards, Freelii enables users to send, receive, and exchange assets smoothly. For demonstration purposes, we've integrated Stellar's Demo Anchor, allowing users to transact with test assets on the Stellar testnet.
- Process Flow: The flow diagram below illustrates how Freelii works, combining SEP standards and innovative design choices for user convenience.

[![Freelii Flow](https://utfs.io/f/XoQ2oTl97RNoJrn22meuEajvC4YgDWPd97BeJspz3Znb28GR)](https://utfs.io/f/XoQ2oTl97RNoJrn22meuEajvC4YgDWPd97BeJspz3Znb28GR)

- Authentication & Verification: Uses Stellar Demo Anchor's SEP-10 for secure login and SEP-12 for KYC verification.
- Currency Conversion: Provides exchange capabilities using SEP-38 for real-time quotes.
- Transaction Management: Manages payments using SEP-31, with enhanced security and optimized processes. We explored SEP-6 for deposit and withdrawal functionalities, though it’s not yet widely adopted.

_Freelii also includes a demonstration of MoneyGram’s cash and bank deposit options, awaiting final integration approval._

## Development Journey and Challenges
The Freelii development journey involved leveraging Stellar's SEP standards and testing integrations to create a robust, user-friendly app. Here are some notable development insights:

- Passkeys Integration: We implemented a passkey system for secure account access, enabling users to sign transactions seamlessly. Our future premium feature, One-Click On-Boarding, aims to allow users to access their accounts without passwords, enhancing user convenience without sacrificing security.

- Soroban Smart Contracts: Initially, we prototyped an escrow smart contract with Soroban. This escrow holds funds until both parties confirm transaction completion, adding security for transactions with new contacts. We hope to fully integrate Soroban contracts in the future for even more control and automation within the platform.

Our goal throughout was to abstract complex blockchain concepts, making Freelii accessible and easy to use for all. This required several workarounds and adjustments as we explored SEP compatibility, particularly with SEP-31 and passkey integration.

#### What's Next?

We envision future iterations of Freelii incorporating Soroban smart contracts more extensively and refining the passkey system for even smoother onboarding. While we currently rely on SEP-31 for transfers, we look forward to further advances in the Stellar ecosystem to improve and expand the platform’s capabilities.

## Technologies Used
- Stellar Network: For secure blockchain-based payments and asset transfers.
- Telegram API: To facilitate bot interactions for simple, efficient transaction management.
- SEP Protocols: SEP-10 for authentication, SEP-12 for KYC, SEP-31 for payments, and SEP-38 for currency quotes.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)

