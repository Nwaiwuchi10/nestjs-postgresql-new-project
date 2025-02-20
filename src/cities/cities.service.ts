import { Injectable } from '@nestjs/common';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly citiesRepository: Repository<City>,
  ) {}

 async create(createCityDto: CreateCityDto) {
    const {name, description, active} =createCityDto
    const city = this.citiesRepository.create(createCityDto);

    return await this.citiesRepository.save(city);
  }

  findAll() {
    const allCities = this.citiesRepository.find()
    return allCities
  }

  findOne(id: number) {
   const singleCity = this.citiesRepository.findOne({
    where:{id}
   })
   return singleCity
  }

  update(id: number, updateCityDto: UpdateCityDto) {
    return `This action updates a #${id} city`;
  }

  remove(id: number) {
    return `This action removes a #${id} city`;
  }
}
