
import * as TL from '@testing-library/react';


TL.configure({
  testIdAttribute: 'data-label',
});

module.exports = async () => {
  // Load .env variables
  //require('dotenv').config();
};
