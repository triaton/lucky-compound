import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HatchMode } from '../types';

@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'enum', enum: HatchMode })
  mode: HatchMode;

  @Column()
  beanRewards: string;

  @Column()
  miningPower: string;

  @Column()
  eggs: string;
}
