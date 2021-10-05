import { PickType } from '@nestjs/swagger';
import { UpdateMembersDto } from './add-members.dto';

export class RemoveMembersDto extends PickType(UpdateMembersDto, ['users']) {}
