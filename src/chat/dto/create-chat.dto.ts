import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class CreateChatDto {
    @ApiProperty()
    @IsUUID()
    userId: string
}
