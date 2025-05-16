import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

Entity("Feed")
export class Feed {
@PrimaryGeneratedColumn()
id:number

@Column()
title:string

@Column()
desc:string

@CreateDateColumn()
createdAt: Date;

@UpdateDateColumn()
updatedAt: Date;

// @Column({type:"timestamp", default:()=>"CURRENT_TIMESTAMP"})
// date: Date
}
