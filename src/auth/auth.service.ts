import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
   constructor(
      @InjectRepository(Auth)
      private readonly AuthRepository: Repository<Auth>,
    ) {}
 async create(createAuthDto: CreateAuthDto) {
    const { email}=createAuthDto
   const userExist =await this.AuthRepository.findOne({
    where:{email}
   })
   if(userExist){
    throw new BadRequestException("User Already exist")
   }
   const newUser = this.AuthRepository.create(createAuthDto)
   await this.AuthRepository.save(newUser);
    return newUser;
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
