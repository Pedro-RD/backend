import { PipeTransform, Injectable, ArgumentMetadata, ForbiddenException, Logger } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
    logger = new Logger('FileSizeValidationPipe');
    transform(value: any, metadata: ArgumentMetadata) {
        this.logger.log(`Incoming file: ${JSON.stringify(value)} with metadata: ${JSON.stringify(metadata)}`);

        if (!value) {
            throw new ForbiddenException('Arquivo não encontrado');
        }

        const allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
        if (!allowedMimeTypes.includes(value.mimetype)) {
            this.logger.error(`Invalid file format: ${value.mimetype}`);
            throw new ForbiddenException('Formato de arquivo inválido. Apenas PNG, JPG e JPEG são permitidos');
        }

        if (value.size > 1000000) {
            this.logger.error(`File size too large: ${value.size}`);
            throw new ForbiddenException('Tamanho máximo permitido é 1MB');
        }

        return value;
    }
}
