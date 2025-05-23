import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from 'src/auth/entities/auth.entity';
import { PAYSTACK_TRANSACTION_INI_URL } from './PaystackConstants';

@Injectable() // Ensure this is present
export class PaystackService {
  @InjectRepository(Auth)
  private readonly AuthRepository: Repository<Auth>;

  constructor(private readonly configService: ConfigService) {}

  async initializePayment(
    userId: number,
    grandTotal: number,
    redirect_url: string,
  ) {
    if (!this.configService) {
      throw new Error('ConfigService is not initialized');
    }
    const user: any = await this.AuthRepository.findOne({
      where: { id: userId },
    });
    //     if (!user)
    //       throw new BadRequestException(`User with ID ${userId} not found`);
    const response = await axios.post(
      PAYSTACK_TRANSACTION_INI_URL,
      {
        email: user.email, // Replace with actual user email
        amount: grandTotal * 100, // Convert to kobo
        currency: 'NGN',
        callback_url: redirect_url,
      },
      {
        headers: {
          Authorization: `Bearer ${this.configService.get<string>('PAYSTACK_SECRET_KEY')}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('Paystack Response:', response.data);

    if (!response.data.data.reference) {
      throw new BadRequestException(
        'Paystack failed to generate a payment reference.',
      );
    }
    return response.data;
  }
}
