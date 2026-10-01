import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from './user.entity';
import { Role } from './enums/role.enum';
import { UserDto } from './dto/user.dto';
import { UsersMapper } from './dto/users.mapper';
import { UserSaveDto } from './dto/user.save-dto';
import { UserUpdateDto } from './dto/user.update-dto';
import { EntitySaveException } from '../exceptions/types/entity-save.exception';
import { EntityNotFoundException } from '../exceptions/types/entity-not-found.exception';
import { EntityUpdateException } from '../exceptions/types/entity-update.exception';
import * as bcrypt from 'bcrypt';
import { UserIsNotConfirmedException } from '../exceptions/types/user-is-not-confirmed.exception';

@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly mapper: UsersMapper,
  ) {}

  async create(saveDto: UserSaveDto): Promise<UserDto> {
    if (await this.repository.isEmailExists(saveDto.email)) {
      throw new EntitySaveException(User.name, 'email');
    }

    const entity: User = this.mapper.mapDtoToEntity(saveDto);
    entity.password = await bcrypt.hash(entity.password, 10);
    entity.role = Role.CUSTOMER;
    entity.active = true;
    await this.repository.save(entity);
    return this.mapper.mapEntityToDto(entity);
  }

  async getAllActiveUsers(): Promise<UserDto[]> {
    const users: User[] = await this.repository.findAllActive();

    if (users.length === 0) {
      throw new EntityNotFoundException(User.name);
    }

    return this.mapper.mapEntityListToDtoList(users);
  }

  async getActiveUserById(id: number): Promise<UserDto> {
    const user: User = await this.getActiveEntityById(id);
    return this.mapper.mapEntityToDto(user);
  }

  async getActiveEntityById(id: number): Promise<User> {
    const user: User | null = await this.repository.findById(id);

    if (!user || !user.active) {
      throw new EntityNotFoundException(User.name, id);
    }

    return user;
  }

  async update(id: number, updateDto: UserUpdateDto): Promise<void> {
    const foundUser: User | null = await this.repository.findById(id);

    if (foundUser) {
      foundUser.name = updateDto.newName;
      await this.repository.save(foundUser);
    } else {
      throw new EntityNotFoundException(User.name, id);
    }
  }

  async deleteById(id: number): Promise<void> {
    const user: User = await this.getActiveEntityById(id);
    user.active = false;
    await this.repository.save(user);
  }

  async restoreById(id: number): Promise<void> {
    const user: User | null = await this.repository.findById(id);

    if (!user) {
      throw new EntityNotFoundException(User.name, id);
    }

    if (!user.active) {
      user.active = true;
      await this.repository.save(user);
    }
  }

  async setRole(id: number, role: Role): Promise<void> {
    const user: User = await this.getActiveEntityById(id);

    if (user.role === role) {
      throw new EntityUpdateException(`User id ${id} already has role ${role}`);
    }

    user.role = role;
    await this.repository.save(user);
  }

  async getConfirmedByEmail(email: string): Promise<User> {
    const user: User | null = await this.repository.findByEmail(email);

    if (!user) {
      throw new EntityNotFoundException(User.name, undefined, email);
    }

    if (!user.active) {
      throw new UserIsNotConfirmedException(email);
    }

    return user;
  }
}
