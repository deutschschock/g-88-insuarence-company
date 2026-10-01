import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { CarsModule } from './cars/cars.module';
import { PoliciesModule } from './policies/policies.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [
    UsersModule,
    CarsModule,
    PoliciesModule,
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5431,
      username: 'admin',
      password: 'secret',
      database: 'g_88_insuarence_company',
      autoLoadEntities: true,
      synchronize: true,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
