import SimpleSchema from 'simpl-schema';
import { SimpleSchema2Bridge } from 'uniforms-bridge-simple-schema-2';

export const DEMO_SIMPLE_SCHEMA = new SimpleSchema2Bridge(
  new SimpleSchema({
    Driver: { type: Object, },
    'Driver.name': { type: String, min: 3, required: false},
    'Driver.age': { type: Number, min: 16, required: false},
    'Driver.claims': { type: SimpleSchema.Integer, min: 0 },
    'Driver.locationRiskProfile': { 
      type: String,
      defaultValue: 'Select',
      allowedValues: ['LOW', 'MEDIUM', 'HIGH'],
      uniforms: {
        options:
          [
            { label: 'Select', value: 'NONE' },
            { label: 'Low', value: 'LOW' },
            { label: 'Medium', value: 'MEDIUM' },
            { label: 'High', value: 'HIGH' },
          ]
      }
    },
    Policy: { type: Object, },
    'Policy.type': { 
      type: String,
      defaultValue: 'Select',
      allowedValues: ['COMPREHENSIVE', 'FIRE_THEFT', 'THIRD_PARTY'],
      uniforms: {
        options:
          [
            { label: 'Select', value: 'NONE' },
            { label: 'Comprehensive', value: 'COMPREHENSIVE' },
            { label: 'Fire Theft', value: 'FIRE_THEFT' },
            { label: '3rd Party', value: 'THIRD_PARTY' },
          ]
      }
    },
    // 'Policy.approved': { type: Boolean, },
    // 'Policy.discountPercent': { type: Number },
    // 'Policy.basePrice': { type: Number },
  })
);

export const DEMO_SIMPLE_SCHEMA_CODE = 
`new SimpleSchema2Bridge(
  new SimpleSchema({
    Driver: { type: Object, },
    'Driver.name': { type: String, min: 3, required: false},
    'Driver.age': { type: Number, min: 16, required: false},
    'Driver.claims': { type: SimpleSchema.Integer, min: 0 },
    'Driver.locationRiskProfile': { 
      type: String,
      defaultValue: 'Select',
      allowedValues: ['LOW', 'MEDIUM', 'HIGH'],
      uniforms: {
        options:
          [
            { label: 'Select', value: 'NONE' },
            { label: 'Low', value: 'LOW' },
            { label: 'Medium', value: 'MEDIUM' },
            { label: 'High', value: 'HIGH' },
          ]
      }
    },
    Policy: { type: Object, },
    'Policy.type': { 
      type: String,
      defaultValue: 'Select',
      allowedValues: ['COMPREHENSIVE', 'FIRE_THEFT', 'THIRD_PARTY'],
      uniforms: {
        options:
          [
            { label: 'Select', value: 'NONE' },
            { label: 'Comprehensive', value: 'COMPREHENSIVE' },
            { label: 'Fire Theft', value: 'FIRE_THEFT' },
            { label: '3rd Party', value: 'THIRD_PARTY' },
          ]
      }
    },
  }))`;

export const DEMO_SIMPLE_SCHEMA_MORTGAGE_CODE = 
`new SimpleSchema2Bridge(
  new SimpleSchema({
    Applicant: { type: Object },
    'Applicant.name': { type: String, min: 3, required: false},
    'Applicant.age': { type: SimpleSchema.Integer, min: 16, required: false},
    'Applicant.applicationDate': { type: Date, defaultValue: new Date(), required: false },
    'Applicant.creditRating': {
      type: String,
      defaultValue: 'Select',
      allowedValues: ['AA', 'OK', 'Sub prime'],
      uniforms: {
        options:
          [
            { label: 'Select', value: 'NONE' },
            { label: 'AA', value: 'AA' },
            { label: 'Ok', value: 'OK' },
            { label: 'Sub prime', value: 'Sub prime' },
          ]
      }
    },
    LoanApplication: { type: Object },
    // 'LoanApplication.approved': { type: Boolean },
    'LoanApplication.amount': { type: Number, required: false },
    'LoanApplication.lengthYears': { type: SimpleSchema.Integer, min: 0, required: false },
    IncomeSource: { type: Object },
    'IncomeSource.amount': { type: Number, required: false },
    'IncomeSource.type': { 
      type: String,
      defaultValue: 'Select',
      allowedValues: ['Job', 'Asset', 'Other'],
      uniforms: {
        options:
          [
            { label: 'Select', value: 'NONE' },
            { label: 'Job', value: 'Job' },
            { label: 'Asset', value: 'Asset' },
            { label: 'Other', value: 'Other' },
          ]
      }
    },
    Bankruptcy: { type: Object },
    'Bankruptcy.amountOwed': { type: Number, required: false },
    'Bankruptcy.yearOfOccurrence': { type: SimpleSchema.Integer, min: 1970, required: false },
  }))`;

  export const DEMO_SIMPLE_SCHEMA_QLB_CODE = 
  `new SimpleSchema2Bridge(
    new SimpleSchema({
      Applicant: { type: Object },
      'Applicant.name': { type: String, min: 3, required: true},
      'Applicant.age': { type: SimpleSchema.Integer, min: 16, required: false},
      'Applicant.creditScore': { type: SimpleSchema.Integer, min: 0, max: 900, required: false},
      //'Applicant.eligible': { type: Boolean, defaultValue: false, required: false },
      'Applicant.yearlyIncome': { type: Number, defaultValue: 0, required: true },
      'Applicant.monthlyIncome': { type: Number, defaultValue: 0, required: true },
  
      Loan: { type: Object },
      'Loan.amount': { type: Number, required: false },
      'Loan.duration': { type: SimpleSchema.Integer, min: 1, required: false },
      //'Loan.interestRate': { type: SimpleSchema.Integer, min: 0, required: false },
    }))`;