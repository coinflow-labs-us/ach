import {File, Batch, Utils, Entry, EntryAddenda} from './nach/index';
import moment from "moment";
import {faker} from "@faker-js/faker";
import * as fs from "node:fs";

async function fuzz() {
  const num = 10;

  for (let i = 0 ; i< num; i++) {
    const targetSum = faker.number.int({min: 2, max: 1_000_000_000});
    const creditAmounts = generateRandomNumbers(targetSum, faker.number.int({min: 1, max: 10000}));
    const debitAmounts = generateRandomNumbers(targetSum, faker.number.int({min: 1, max: 10000}));
    const credits = creditAmounts.map(getCredit);
    const debits = debitAmounts.map(getDebit);
    await createNachaFile(i.toString(), debits, credits);
  }
}

function generateRandomNumbers(targetSum: number, numElements: number): number[] {
  if (numElements <= 0) {
    throw new Error("numElements must be greater than 0");
  }

  if (targetSum <= 0) {
    throw new Error("targetSum must be greater than 0");
  }

  // Generate numElements random numbers
  let randomNumbers: number[] = [];
  for (let i = 0; i < numElements; i++) {
    randomNumbers.push(Math.random());
  }

  // Calculate the sum of the random numbers
  let sumRandomNumbers = randomNumbers.reduce((sum, num) => sum + num, 0);

  // Scale the numbers to sum to targetSum and round to 2 decimal places
  randomNumbers = randomNumbers.map(num => parseFloat(((num / sumRandomNumbers) * targetSum).toFixed(2)));

  // Adjust the last element to ensure the sum is exactly targetSum
  let currentSum = randomNumbers.reduce((sum, num) => sum + num, 0);
  randomNumbers[randomNumbers.length - 1] = Number((randomNumbers[randomNumbers.length - 1] + parseFloat((targetSum - currentSum).toFixed(2))).toFixed(2));

  return randomNumbers;
}

function getDebit(amount: number): Debit {
  return {
    receivingDFI: faker.finance.routingNumber(),
    DFIAccount: faker.finance.accountNumber(),
    amount: amount.toString(),
    idNumber: faker.string.alphanumeric({length: 15}),
    individualName: faker.person.fullName(),
    discretionaryData: faker.string.alpha({length: 1}).toUpperCase() + faker.string.numeric({length: 1}),
    addenda: faker.string.alphanumeric({length: 62}), // Randomize length
    transactionCode: '22'
  };
}

function getCredit(amount: number): Credit {
  return {
    receivingDFI: faker.finance.routingNumber(),
    DFIAccount: faker.finance.accountNumber(),
    amount: amount.toString(),
    idNumber: faker.string.alphanumeric({length: 15}),
    individualName: faker.person.fullName(),
    discretionaryData: faker.string.alpha({length: 1}).toUpperCase() + faker.string.numeric({length: 1}),
    transactionCode: '27'
  };
}

interface Debit {
  receivingDFI: string;
  DFIAccount: string;
  amount: string;
  idNumber: string;
  individualName: string;
  discretionaryData: string; // legnth 2
  addenda: string;
  transactionCode: '22'
}

interface Credit {
  receivingDFI: string;
  DFIAccount: string;
  amount: string;
  idNumber: string;
  individualName: string;
  discretionaryData: string; // legnth 2
  transactionCode: '27'
}

async function createNachaFile(fileName: string, debits: Debit[], credits: Credit[]) {
  const file = new File({
    immediateDestination: '<DESTINATION_ROUTING>',
    immediateOrigin: '<DESTINATION_ROUTING>',
    immediateDestinationName: '<immediateDestinationName>',
    immediateOriginName: '<immediateOriginName>',
    referenceCode: '#A000001',
  });

  const batch = new Batch({
    serviceClassCode: '200',
    companyName: '<companyName>',
    standardEntryClassCode: 'PPD',
    companyIdentification: '<DESTINATION_ACCT>',
    companyEntryDescription: 'TRANSDESCRIOPTION',
    companyDescriptiveDate: moment(Utils.computeBusinessDay(1)).format('MMM D'),
    effectiveEntryDate: Utils.computeBusinessDay(1),
    originatingDFI: '<DESTINATION_ROUTING>'
  });

  for (const debit of debits) {
    const debit1entry = new Entry(debit);
    debit1entry.addAddenda(new EntryAddenda({
      paymentRelatedInformation: debit.addenda
    }));
    batch.addEntry(debit1entry);
  }

  for (const credit of credits) {
    const creditEntry = new Entry(credit);
    batch.addEntry(creditEntry);
  }

  file.addBatch(batch);
  file.generateFile(function(result) {
    result = result.replace(/\r/g, '');
    fs.writeFileSync(`/Users/benmeeder/Downloads/tmp/${fileName}.ach`, result, {encoding: 'ascii'});
  });
}

fuzz().then(nachaFileString => {
  // console.log('NACHA File:', nachaFileString);
}).catch(error => {
  console.error('Error converting JSON to NACHA:', error);
});
