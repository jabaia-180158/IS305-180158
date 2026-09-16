/*
Program: Dining Meal Booking Feature - Lab 3
Student Name: Joseph ABAIA
Student ID: 180158
Date: 16 September 2026
Description: RewardsDiningAccount subclass
*/

import { DiningAccount } from './DiningAccount.js';

export class RewardsDiningAccount extends DiningAccount {

    // Private field
    #rewardRate;

    // Constructor chaining using super()
    constructor(accountNumber, openingBalance = 0, rewardRate = 0) {

        super(accountNumber, openingBalance);

        // Validate reward rate
        if (
            typeof rewardRate !== 'number' ||
            !Number.isFinite(rewardRate)
        ) {
            throw new Error('Reward rate must be a valid number');
        }

        if (rewardRate < 0) {
            throw new Error('Reward rate cannot be negative');
        }

        this.#rewardRate = rewardRate;
    }

    // Override account type
    getAccountType() {
        return 'RewardsDiningAccount';
    }

    // Get reward rate
    getRewardRate() {
        return this.#rewardRate;
    }

    // Calculate reward
    // Reward = current balance × reward rate ÷ 100
    calculateReward() {
        return this.getBalance() * this.#rewardRate / 100;
    }

    // Apply reward to account
    applyReward() {

        const reward = this.calculateReward();

        if (reward <= 0) {
            return 0;
        }

        // Use inherited deposit method
        this.deposit(
            reward,
            `Rewards bonus at ${this.#rewardRate}%`
        );

        return reward;
    }

    // Override account summary
    displayAccountSummary() {
        console.log(`
========================================
      REWARDS DINING ACCOUNT
========================================
Account Number: ${this.getAccountNumber()}
Account Type:   ${this.getAccountType()}
Balance:        K${this.getBalance().toFixed(2)}
Reward Rate:    ${this.#rewardRate}%
Reward Earned:  K${this.calculateReward().toFixed(2)}
========================================
        `);
    }
}