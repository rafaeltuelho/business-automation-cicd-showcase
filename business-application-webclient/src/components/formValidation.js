/**
 * Common Form validation functions
 */
export function formValidate(fieldsValidation) {
  // const fieldsValidation = this.state.fieldsValidation;
  let invalidFields = null;
  let valid = true;

  // for each Object in the Form's fieldsValidation 
  Object.getOwnPropertyNames(fieldsValidation).forEach(p => {
    // console.debug('formValidate() \n\t traverssing obj property [' + p + '] is obj type: ' + (fieldsValidation[p] instanceof Object));
    invalidFields = Object.keys(fieldsValidation[p]).filter(k => !fieldsValidation[p][k].valid());

    if (invalidFields.length > 0) { 
      // console.debug('formValidate() \n\t obj [' + p + '] contains ' + invalidFields.length + ' invalid field(s)');
      valid = false;
      return;
    }
  });
  return valid;
};  

export default { formValidate };