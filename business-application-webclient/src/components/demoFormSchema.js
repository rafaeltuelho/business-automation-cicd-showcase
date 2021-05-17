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