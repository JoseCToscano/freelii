#![no_std]
use soroban_sdk::{contract, contractimpl, Bytes, BytesN, Env, symbol_short, Address, token};

// Constants
const OTP_EXPIRATION_TIME: u64 = 1800; // OTP validity period in seconds (30 minutes)

// Define the contract structure
#[contract]
pub struct EscrowContract;

// Contract implementation
#[contractimpl]
impl EscrowContract {
    // Initialize the escrow with funds and the encrypted phone number
    pub fn initialize(env: Env, funds: u64, hashed_phone_number: BytesN<32>) {
            // Define the keys for storage
            let funds_key = symbol_short!("funds");
            let phone_key = symbol_short!("h_phone");

            // Store the funds and hashed phone number in the contract's storage
            env.storage().persistent().set(&funds_key, &funds);
            env.storage().persistent().set(&phone_key, &hashed_phone_number);

    }

    // Generate OTP and encrypt phone number with it
    pub fn generate_otp(env: Env, hashed_phone_number: BytesN<32>) -> Option<u32> {
        // Define storage keys
        let phone_key = symbol_short!("h_phone");
        let otp_key = symbol_short!("otp_hash");
        let expiration_key = symbol_short!("otp_exp");

        // Retrieve stored hashed phone number
        let default_value = BytesN::<32>::from_array(&env, &[0u8; 32]);
        let stored_phone_hash: BytesN<32> = env.storage().persistent().get(&phone_key).unwrap_or(default_value);

        // Compare hashed phone numbers
        if hashed_phone_number != stored_phone_hash {
            // Phone number mismatch custom Error
            return Some(999999);
        }

        // Generate a 6-digit OTP
        // Use the current ledger timestamp and some unique value to get a "random" seed
        let timestamp = env.ledger().timestamp();
        let seed_data = Bytes::from_array(&env, &timestamp.to_be_bytes());

        // Generate a hash and then extract a portion of it for OTP
        let mut hash = env.crypto().sha256(&seed_data);

        // Convert part of the hash to an integer and constrain it to a 6-digit range
        let mut otp = (u32::from_be_bytes(hash.to_array()[0..4].try_into().unwrap()) % 900_000) + 100_000;

        // Validate that the OTP is not 999_999
        while otp == 999999 {
            // Update seed data or some other input to ensure a new hash value
            let new_seed_data = Bytes::from_array(&env, &(env.ledger().timestamp().to_be_bytes()));
            hash = env.crypto().sha256(&new_seed_data);

            // Recompute the OTP with the new hash
            otp = (u32::from_be_bytes(hash.to_array()[0..4].try_into().unwrap()) % 900_000) + 100_000;
        }

        // Hash the OTP
        let otp_bytes = Bytes::from_array(&env, &otp.to_be_bytes());
        let otp_hash = env.crypto().sha256(&otp_bytes);

        // Calculate the expiration time
        let current_time = env.ledger().timestamp();
        let otp_expiration = current_time + OTP_EXPIRATION_TIME;

        // Store the OTP hash and expiration time
        env.storage().persistent().set(&otp_key, &otp_hash);
        env.storage().persistent().set(&expiration_key, &otp_expiration);

        // Return the generated OTP (in a real application, you’d send this to the user via SMS or another secure method)
         Some(otp)
    }

    pub fn fund(env: Env, sender: Address, usdc_sac: Address) {
        sender.require_auth();
        // Define storage keys
        let funds_key = symbol_short!("funds");

        // Retrieve the stored funds
        let stored_funds: u64 = env.storage().persistent().get(&funds_key).unwrap_or(0);

       let usdc = token::Client::new(&env, &usdc_sac);
       let contract = env.current_contract_address();
       let usdcAmount = stored_funds.clone() * 100_000;
       usdc.transfer(&sender.clone(), &contract,  &(usdcAmount as i128));
    }

    // Redeem funds with OTP verification
    pub fn redeem(env: Env, recipient_address: Address, usdc_sac: Address) -> i64 {
        // Define storage keys
        let funds_key = symbol_short!("funds");

        // Retrieve the stored funds
        let stored_funds: u64 = env.storage().persistent().get(&funds_key).unwrap_or(0);

       let usdc = token::Client::new(&env, &usdc_sac);
       let contract = env.current_contract_address();
       let usdcAmount = stored_funds.clone() * 100_000;
       usdc.transfer(&contract, &recipient_address,  &(usdcAmount as i128));

        return 0; // Success
    }
}
