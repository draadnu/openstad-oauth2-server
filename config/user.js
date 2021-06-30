exports.fields = [
  {
    key: 'firstName',
    label: 'Voornaam'
  },
  {
    key: 'lastName',
    label: 'Achternaam'
  },
  {
    key: 'postcode',
    label: 'Postcode'
  },
  {
    key: 'email',
    label: 'E-mail'
  },
  {
    key: 'streetName',
    label: 'Straatnaam'
  }
];

exports.validation = {
  profile : {
    firstName : {
      errorMessage: 'Voornaam moet ingevuld zijn',
      isLength: {
        options:{ min: 1, maxLength: 155 }
      }
    },
    lastName: {
      errorMessage: 'Achternaam moet ingevuld zijn',
      isLength: {
        options:{ min: 1, maxLength: 155 }
      }
    },
    // E-mail is not validated, since in most re
    email : {
      errorMessage: 'E-mail is niet correct',
      isLength: { options:{ min: 1, maxLength: 155 }},
      isEmail: true
    }
  }
}
;
