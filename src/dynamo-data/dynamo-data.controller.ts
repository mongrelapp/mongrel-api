import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AuthUser } from 'src/common/decorators/auth-user.decorator';
import { User } from 'src/users/user.entity';
import { InsertDataDto } from './dto/insert-data.dto';
import { DynamoDataService } from './dynamo-data.service';

@Controller('dynamo-data')
@ApiTags('Dynamo Data')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class DynamoDataController {
  /**
   * Insert data to Dynamo DB
   */
  @Post(':table/data')
  @ApiOperation({ summary: 'Insert data to Dynamo DB' })
  @ApiParam({ name: 'table', description: 'The tableId of Dynamo DB' })
  async insertData(
    @AuthUser() authUser: User,
    @Param('table') tableId: string,
    @Body() insertDataDto: InsertDataDto,
  ) {
    const data = await this.dynamoDataService.insertData(
      authUser,
      tableId,
      insertDataDto,
    );
    return { message: 'Data inserted successfully', data };
  }

  constructor(private dynamoDataService: DynamoDataService) {}
}
