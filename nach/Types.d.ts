export interface FileOptions {
  immediateDestination: string;
  immediateOrigin: string;
  immediateDestinationName: string;
  immediateOriginName: string;
  referenceCode: string;
}

export interface BatchOptions {
  serviceClassCode: string;
  companyName: string;
  standardEntryClassCode: string;
  companyIdentification: string;
  companyEntryDescription: string;
  companyDescriptiveDate: string;
  effectiveEntryDate: Date;
  originatingDFI: string;
}

export interface EntryOptions {
  receivingDFI: string;
  DFIAccount: string;
  amount: string;
  idNumber: string;
  individualName: string;
  discretionaryData: string;
  transactionCode: string;
}

export interface AddendaOptions {
  paymentRelatedInformation: string;
}

export class File {
  constructor(options: FileOptions);
  addBatch(batch: Batch): void;
  generateFile(callback: (result: string) => void): void;
}

export class Batch {
  constructor(options: BatchOptions);
  addEntry(entry: Entry): void;
}

export class Entry {
  constructor(options: EntryOptions);
  addAddenda(addenda: EntryAddenda): void;
}

export class EntryAddenda {
  constructor(options: AddendaOptions);
}

export namespace Utils {
  function computeBusinessDay(offset: number): Date;
}
