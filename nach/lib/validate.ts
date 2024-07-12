import * as _ from 'lodash';
import * as utils from './utils';
import nACHError from './error';
import error from "./error";

const ACHAddendaTypeCodes: string[] = ['02', '05', '98', '99'];
const ACHTransactionCodes: string[] = ['22', '23', '24', '27', '28', '29', '32', '33', '34', '37', '38', '39'];
const ACHServiceClassCodes: string[] = ['200', '220', '225'];
const numericRegex: RegExp = /^[0-9]+$/;
const alphaRegex: RegExp = /^[a-zA-Z]+$/;
const alphanumericRegex: RegExp = /^[0-9a-zA-Z!"#$%&'()*+,-.\/:;<>=?@\[\]\\^_`{}|~ ]+$/;

interface Field {
	name: string;
	value: any;
	required?: boolean;
	width?: number;
	blank?: boolean;
	type?: 'numeric' | 'alpha' | 'alphanumeric';
}

function validateRequiredFields(object: Record<string, Field>): boolean {
	_.forEach(object, (field: Field) => {
		if (field.required === true && (_.isNaN(field.value) || _.isNull(field.value) || _.isUndefined(field.value) || field.value.toString().length === 0)) {
			throw new nACHError({
				name: 'Required Field Blank',
				message: `${field.name} is a required field but its value is: ${field.value}`
			});
		}
	});

	return true;
}

function validateLengths(object: Record<string, Field>): boolean {
	_.forEach(object, (field: Field) => {
		if (field.value.toString().length > field.width!) {
			console.error({field});
			throw new nACHError({
				name: 'Invalid Length',
				message: `${field.name}'s length is ${field.value.length}, but it should be no greater than ${field.width}.`
			});
		}
	});

	return true;
}

function getNextMultipleDiff(value: number, multiple: number): number {
	return (value + (multiple - value % multiple)) - value;
}

function validateDataTypes(object: Record<string, Field>): boolean {
	_.forEach(object, (field: Field) => {
		if (field.blank !== true) {
			switch (field.type) {
				case 'numeric':
					utils.testRegex(numericRegex, field);
					break;
				case 'alpha':
					utils.testRegex(alphaRegex, field);
					break;
				case 'alphanumeric':
					utils.testRegex(alphanumericRegex, field);
					break;
			}
		}
	});

	return true;
}

function validateACHAddendaTypeCode(addendaTypeCode: string): boolean {
	if (addendaTypeCode.length !== 2 || !_.includes(ACHAddendaTypeCodes, addendaTypeCode)) {
		throw new nACHError({
			name: 'ACH Addenda Type Code Error',
			message: `The ACH addenda type code ${addendaTypeCode} is invalid. Please pass a valid 2-digit addenda type code.`
		});
	}

	return true;
}

function validateACHCode(transactionCode: string): boolean {
	if (transactionCode.length !== 2 || !_.includes(ACHTransactionCodes, transactionCode)) {
		throw new nACHError({
			name: 'ACH Transaction Code Error',
			message: `The ACH transaction code ${transactionCode} is invalid. Please pass a valid 2-digit transaction code.`
		});
	}

	return true;
}

function validateACHServiceClassCode(serviceClassCode: string): boolean {
	if (serviceClassCode.length !== 3 || !_.includes(ACHServiceClassCodes, serviceClassCode)) {
		throw new nACHError({
			name: 'ACH Service Class Code Error',
			message: `The ACH service class code ${serviceClassCode} is invalid. Please pass a valid 3-digit service class code.`
		});
	}

	return true;
}

function validateRoutingNumber(routing: string): boolean {
	if (routing.toString().length !== 9) {
		throw new nACHError({
			name: 'Invalid ABA Number Length',
			message: `The ABA routing number ${routing} is ${routing.toString().length}-digits long, but it should be 9-digits long.`
		});
	}

	const array: number[] = routing.split('').map(Number);

	const sum: number =
		3 * (array[0] + array[3] + array[6]) +
		7 * (array[1] + array[4] + array[7]) +
		1 * (array[2] + array[5] + array[8]);

	if (sum % 10 !== 0) {
		throw new nACHError({
			name: 'Invalid ABA Number',
			message: `The ABA routing number ${routing} is invalid. Please ensure a valid 9-digit ABA routing number is passed.`
		});
	}

	return true;
}

export {
	validateRequiredFields,
	validateLengths,
	validateDataTypes,
	validateACHAddendaTypeCode,
	validateACHCode,
	validateACHServiceClassCode,
	validateRoutingNumber,
	getNextMultipleDiff
};
