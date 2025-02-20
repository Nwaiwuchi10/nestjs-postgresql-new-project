import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from "bcryptjs";
@Entity()
export class Address{
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    street:string

    @Column()
    city:string

    @Column()
    state:string

    @Column()
    zipcode:string

    @Column()
    country:string
}
@Entity()
export class Auth {
    @PrimaryGeneratedColumn()
    id:number;

    // @Column()
    // userId:string;


    @Column()
    firstName:string

    @Column()
    lastName:string

    @Column({unique:true})
    email:string

    @Column({nullable: true})
    phoneNumber:string


    @OneToOne(() => Address, { cascade: true, eager: true })
    @JoinColumn()
    address: Address;
    // @Column()
    // address:Address

    // @Column()
    // profilePics:string

    @Column()
    password:string;


    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        if (this.password) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
    }
   
}
