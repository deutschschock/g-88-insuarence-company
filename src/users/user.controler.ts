// import { Controller } from '@nestjs/common';
// import { User } from './user.entity.js';
// import {Post} from "@nestjs/common";
// import {Body} from "@nestjs/common";
//
// // http://10.20.30.40:3001/users
// @Controller('users')
// export class UsersController {
//     @Post()
//     create(@Body() user: User): User {
//         // Здесь будет обращение к сервису,
//         // но пока пишем здесь тренировочный код, который
//         // позволит нам протестировать контроллер в реальном времени
//         console.log('Saved user:', user);
//         user.id = 7;
//         return user;
//     }
// }