import { Injectable } from '@nestjs/common';
import { BigNumber, Contract, providers, Wallet } from 'ethers';
import * as bep20Abi from './abi/bep20.json';
import * as masterChefAbi from './abi/masterchef.json';
import * as routerAbi from './abi/router.json';
import * as lcDiceAbi from './abi/lcdice.json';
import {
  LC_PID,
  LCAddress,
  LCDiceAddress,
  LuckyLCAddress,
  MasterChefAddress,
  referrer,
  RouterAddress,
  RPC_URL,
  wbnbAddress,
} from './consts';
import { InjectRepository } from '@nestjs/typeorm';
import { Withdrawal } from './entities/withdrawal.entity';
import { Repository } from 'typeorm';
import { transformPvKey } from './utils';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Withdrawal)
    private withdrawalRepository: Repository<Withdrawal>,
  ) {}

  async withdrawalIndex(): Promise<number> {
    return this.withdrawalRepository.count();
  }

  async getPendingLC(address: string): Promise<BigNumber> {
    const contract = this.getMasterChefContract();
    return contract.pendingLC(LC_PID, address);
  }

  async isTablePaused(): Promise<boolean> {
    const contract = this.getLCDiceContract();
    return contract.paused;
  }

  async harvestLC(): Promise<void> {
    const contract = this.getMasterChefContract();
    const tx = await contract.claimLC(LC_PID);
    await tx.wait();
  }

  async swapLCToBNB(): Promise<void> {
    const stakingWallet = this.getStakingWallet();
    const lcBalance = await WalletService.getTokenBalance(
      stakingWallet.address,
      LCDiceAddress,
    );
    if (lcBalance.gt(0)) {
      const bnbAmountOut = await this.getBNBAmountOut(lcBalance);
      const router = this.getRouterContract();
      const now = new Date();
      now.setMinutes(now.getMinutes() + 20);
      await router.swapExactTokensForETH(
        lcBalance.toString(),
        bnbAmountOut.toString(),
        [LCDiceAddress, wbnbAddress],
        stakingWallet.address,
        now.getTime(),
      );
    }
  }

  async bankLC(): Promise<void> {
    const diceContract = this.getLCDiceContract();
    const stakingWallet = this.getStakingWallet();
    const lcBalance = await WalletService.getTokenBalance(
      stakingWallet.address,
      LCDiceAddress,
    );
    const tx = await diceContract.deposit(lcBalance.toString());
    await tx.wait();
  }

  async stakeLuckyLC(): Promise<void> {
    const contract = this.getMasterChefContract();
    const stakingWallet = this.getStakingWallet();
    const luckyLcBalance = await WalletService.getTokenBalance(
      stakingWallet.address,
      LuckyLCAddress,
    );
    const tx = await contract.deposit(
      LC_PID,
      luckyLcBalance.toString(),
      referrer,
    );
    await tx.wait();
  }

  getStakingWallet(): Wallet {
    const pvKey = transformPvKey('PRIVATE_KEY');
    return WalletService.getWallet(pvKey);
  }

  async getWalletBalance(address: string): Promise<BigNumber> {
    const provider = new providers.JsonRpcProvider(RPC_URL);
    return provider.getBalance(address);
  }

  private static getWallet(pvKey: string): Wallet {
    const provider = new providers.JsonRpcProvider(RPC_URL);
    return new Wallet(pvKey, provider);
  }

  static getTokenBalance(
    address: string,
    contractAddress: string,
  ): Promise<BigNumber> {
    const provider = new providers.JsonRpcProvider(RPC_URL);
    const tokenContract = new Contract(contractAddress, bep20Abi, provider);
    return tokenContract.balanceOf(address);
  }

  private getMasterChefContract(): Contract {
    return new Contract(
      MasterChefAddress,
      masterChefAbi,
      this.getStakingWallet(),
    );
  }

  private getLCDiceContract(): Contract {
    return new Contract(LCDiceAddress, lcDiceAbi, this.getStakingWallet());
  }

  private getRouterContract(): Contract {
    return new Contract(RouterAddress, routerAbi, this.getStakingWallet());
  }

  private async getBNBAmountOut(lcAmount: BigNumber): Promise<BigNumber> {
    const routerContract = this.getRouterContract();
    const [, result] = await routerContract.getAmountsOut(lcAmount.toString(), [
      LCAddress,
      wbnbAddress,
    ]);
    return result;
  }
}
