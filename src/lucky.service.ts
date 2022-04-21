import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LCAddress, MIN_LC_COMPOUND, MIN_STAKING_WALLET_BALANCE } from './consts';
import { WalletService } from './wallet.service';
import { ConfigService } from './config.service';

@Injectable()
export class LuckyService {
  constructor(
    private readonly walletService: WalletService,
    private readonly configService: ConfigService,
  ) {}

  @Cron('0 */5 * * * *')
  async handleCron() {
    if (!this.configService.getIsRunning()) {
      return;
    }
    const isPaused = await this.walletService.isTablePaused();

    // do cron only when the lc dice table is paused
    if (!isPaused) {
      return;
    }
    const { address } = this.walletService.getLCStakingWallet();
    const lcBalance = await WalletService.getTokenBalance(address, LCAddress);

    if (lcBalance.gte(MIN_LC_COMPOUND)) {
      await this.walletService.bankLC();
      await this.walletService.stakeLuckyLC();
      return;
    }

    const pendingLC = await this.walletService.getPendingLC(address);

    // do nothing when the pending lc reward is small
    if (pendingLC.lt(MIN_LC_COMPOUND)) {
      return;
    }

    // harvest lc reward
    await this.walletService.harvestLC();
    const stakingBalance = await this.walletService.getWalletBalance(address);
    if (stakingBalance.lt(MIN_STAKING_WALLET_BALANCE)) {
      await this.walletService.swapLCToBNB();
    } else {
      await this.walletService.bankLC();
      await this.walletService.stakeLuckyLC();
    }
  }
}
