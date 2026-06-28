import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'node:path';
import { AuthModule } from '../auth/auth.module';
import { CategoryModule } from '../category/category.module';
import { MenuModule } from '../menu/menu.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database:
        process.env.DATABASE_PATH ??
        join(process.cwd(), 'apps/api/emenu.sqlite'),
      autoLoadEntities: true,
      // Dev convenience: auto-create the schema. Use migrations in production.
      synchronize: true,
    }),
    AuthModule,
    CategoryModule,
    MenuModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
