import path from 'path';
import type { ICliCommand } from '../interfaces/ICliCommand.js';
import type { IFileService } from '../interfaces/IFileService.js';
import type { ILogger } from '../interfaces/ILogger.js';
import type { IPdfGenerator } from '../interfaces/IPdfGenerator.js';

export class GenerateConfirmationCommand implements ICliCommand {
  constructor(
    private generator: IPdfGenerator,
    private fileService: IFileService,
    private logger: ILogger,
    private inputPath: string,
    private outputPath: string,
    private additionalData?: any
  ) {}

  async execute(): Promise<void> {
    try {
      this.logger.info(`Generowanie potwierdzenia transakcji PDF z: ${this.inputPath}`);

      const xmlContent = await this.fileService.readXmlFile(this.inputPath);
      const file = this.fileService.createFileFromContent(xmlContent, path.basename(this.inputPath));

      const pdfBlob = await this.generator.generate(file, this.additionalData);

      await this.fileService.writePdfFile(pdfBlob, this.outputPath);

      this.logger.success(`Potwierdzenie transakcji PDF wygenerowane pomyślnie: ${this.outputPath}`);
    } catch (error) {
      this.logger.error('Błąd podczas generowania potwierdzenia transakcji PDF:', error);
      throw error;
    }
  }
}
