import { Injectable } from '@nestjs/common';
import { CreateFeedDto } from './dto/create-feed.dto';
import { UpdateFeedDto } from './dto/update-feed.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Feed } from './entities/feed.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FeedService {
  constructor(
     @InjectRepository(Feed)
          private readonly FeedRepository: Repository<Feed>,
  ){}
 async create(createFeedDto: CreateFeedDto) {
    const {title, desc}=createFeedDto
    const createData=  this.FeedRepository.create({
      title, desc
    })
    const newData= await this.FeedRepository.save(createData)
    return newData ;
  }

  findAll() {
    return `This action returns all feed`;
  }

  findOne(id: number) {
    return `This action returns a #${id} feed`;
  }

  update(id: number, updateFeedDto: UpdateFeedDto) {
    return `This action updates a #${id} feed`;
  }

  remove(id: number) {
    return `This action removes a #${id} feed`;
  }
}
