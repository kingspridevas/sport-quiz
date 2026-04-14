import { 
  authenticate, 
  createVirtualAccount, 
  reallocateVirtualAccount, 
  deactivateVirtualAccount, 
  reactivateVirtualAccount,
  confirmPayment 
} from './psb-service';

const PSB_BASE_URL = "https://baas.9psb.com.ng/iva-api/v1/merchant/virtualaccount";

interface TestResult {
  scenario: string;
  request: any;
  response: any;
  status: 'SUCCESS' | 'FAILURE' | 'ERROR';
}

const results: TestResult[] = [];

function generateReference(): string {
  return `SQ${Date.now()}${Math.random().toString(36).substring(2, 8)}`;
}

async function runTests() {
  console.log('\n========================================');
  console.log('9PSB UAT TEST SCENARIOS');
  console.log('========================================\n');

  let createdAccountNumber: string | null = null;
  let successfulReference: string | null = null;

  // ========================================
  // DYNAMIC ACCOUNT CREATION TESTS
  // ========================================
  console.log('\n--- DYNAMIC ACCOUNT CREATION TESTS ---\n');

  // Test 1: Successful creation with valid details
  console.log('Test 1: Dynamic account creation successful using valid details');
  try {
    const ref1 = generateReference();
    successfulReference = ref1;
    const request1 = {
      amount: 1000,
      customerName: 'TIMOTHY OLAWUYI',
      reference: ref1,
      description: 'UAT Test - Valid Creation'
    };
    console.log('REQUEST:', JSON.stringify(request1, null, 2));
    
    const response1 = await createVirtualAccount(request1);
    createdAccountNumber = response1.customer?.account?.number || null;
    console.log('RESPONSE:', JSON.stringify(response1, null, 2));
    results.push({ scenario: 'Create - Valid Details', request: request1, response: response1, status: 'SUCCESS' });
  } catch (error: any) {
    console.log('ERROR:', error.message);
    results.push({ scenario: 'Create - Valid Details', request: {}, response: error.message, status: 'ERROR' });
  }

  // Test 2: Failure with duplicate reference
  console.log('\nTest 2: Dynamic account creation failure using Duplicate reference');
  try {
    const request2 = {
      amount: 1000,
      customerName: 'TIMOTHY OLAWUYI',
      reference: successfulReference!, // Using same reference
      description: 'UAT Test - Duplicate Reference'
    };
    console.log('REQUEST:', JSON.stringify(request2, null, 2));
    
    const response2 = await createVirtualAccount(request2);
    console.log('RESPONSE:', JSON.stringify(response2, null, 2));
    results.push({ scenario: 'Create - Duplicate Reference', request: request2, response: response2, status: 'SUCCESS' });
  } catch (error: any) {
    console.log('EXPECTED FAILURE:', error.message);
    results.push({ scenario: 'Create - Duplicate Reference', request: {}, response: error.message, status: 'FAILURE' });
  }

  // Test 3: Failure with invalid account type
  console.log('\nTest 3: Dynamic Account creation Failure using Invalid account type');
  try {
    const token = await authenticate();
    const ref3 = generateReference();
    const request3 = {
      transaction: { reference: ref3 },
      order: {
        amount: 1000,
        currency: 'NGN',
        description: 'UAT Test - Invalid Type',
        country: 'NGA',
        amounttype: 'EXACT'
      },
      customer: {
        account: {
          name: 'TIMOTHY OLAWUYI',
          type: 'INVALID_TYPE', // Invalid type
          expiry: { hours: 1 }
        }
      }
    };
    console.log('REQUEST:', JSON.stringify(request3, null, 2));
    
    const response = await fetch(`${PSB_BASE_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(request3)
    });
    const response3 = await response.json();
    console.log('RESPONSE:', JSON.stringify(response3, null, 2));
    results.push({ scenario: 'Create - Invalid Account Type', request: request3, response: response3, status: response3.code === '00' ? 'SUCCESS' : 'FAILURE' });
  } catch (error: any) {
    console.log('ERROR:', error.message);
    results.push({ scenario: 'Create - Invalid Account Type', request: {}, response: error.message, status: 'ERROR' });
  }

  // Test 4: Failure with invalid amount type
  console.log('\nTest 4: Dynamic Account creation Failure using Invalid amount type');
  try {
    const token = await authenticate();
    const ref4 = generateReference();
    const request4 = {
      transaction: { reference: ref4 },
      order: {
        amount: 1000,
        currency: 'NGN',
        description: 'UAT Test - Invalid Amount Type',
        country: 'NGA',
        amounttype: 'INVALID_AMOUNT_TYPE' // Invalid - should be EXACT, HIGHEROREXACT, LOWEROREXACT, or ANY
      },
      customer: {
        account: {
          name: 'TIMOTHY OLAWUYI',
          type: 'DYNAMIC',
          expiry: { hours: 1 }
        }
      }
    };
    console.log('REQUEST:', JSON.stringify(request4, null, 2));
    
    const response = await fetch(`${PSB_BASE_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(request4)
    });
    const response4 = await response.json();
    console.log('RESPONSE:', JSON.stringify(response4, null, 2));
    results.push({ scenario: 'Create - Invalid Amount Type', request: request4, response: response4, status: response4.code === '00' ? 'SUCCESS' : 'FAILURE' });
  } catch (error: any) {
    console.log('ERROR:', error.message);
    results.push({ scenario: 'Create - Invalid Amount Type', request: {}, response: error.message, status: 'ERROR' });
  }

  // ========================================
  // REALLOCATE TESTS
  // ========================================
  console.log('\n--- REALLOCATE ACCOUNT TESTS ---\n');

  // Test 5: Successful reallocation
  console.log('Test 5: Successful account reallocation using unique reference');
  let reallocatedRef: string | null = null;
  try {
    const ref5 = generateReference();
    reallocatedRef = ref5;
    const request5 = {
      transaction: { reference: ref5 },
      order: {
        amount: 2000,
        currency: 'NGN',
        description: 'UAT Test - Valid Reallocation',
        country: 'NGA',
        amounttype: 'EXACT'
      },
      customer: {
        account: {
          name: 'EBUNLOMO OLUMOWO',
          number: createdAccountNumber || '1234567890',
          expiry: { hours: 1 }
        }
      }
    };
    console.log('REQUEST:', JSON.stringify(request5, null, 2));
    
    const response5 = await reallocateVirtualAccount({
      accountNumber: createdAccountNumber || '1234567890',
      newReference: ref5,
      amount: 2000,
      customerName: 'EBUNLOMO OLUMOWO',
      description: 'UAT Test - Valid Reallocation'
    });
    console.log('RESPONSE:', JSON.stringify(response5, null, 2));
    results.push({ scenario: 'Reallocate - Valid', request: request5, response: response5, status: 'SUCCESS' });
  } catch (error: any) {
    console.log('ERROR:', error.message);
    results.push({ scenario: 'Reallocate - Valid', request: {}, response: error.message, status: 'ERROR' });
  }

  // Test 6: Failure with incomplete account number
  console.log('\nTest 6: Account reallocation failure using incomplete account number');
  const ref6 = generateReference();
  try {
    const request6 = {
      transaction: { reference: ref6 },
      order: {
        amount: 2000,
        currency: 'NGN',
        description: 'UAT Test - Incomplete Account',
        country: 'NGA',
        amounttype: 'EXACT'
      },
      customer: {
        account: {
          name: 'EBUNLOMO OLUMOWO',
          number: '123',
          expiry: { hours: 1 }
        }
      }
    };
    console.log('REQUEST:', JSON.stringify(request6, null, 2));
    
    const response6 = await reallocateVirtualAccount({
      accountNumber: '123',
      newReference: ref6,
      amount: 2000,
      customerName: 'EBUNLOMO OLUMOWO',
      description: 'UAT Test - Incomplete Account'
    });
    console.log('RESPONSE:', JSON.stringify(response6, null, 2));
    results.push({ scenario: 'Reallocate - Incomplete Account', request: request6, response: response6, status: 'SUCCESS' });
  } catch (error: any) {
    console.log('EXPECTED FAILURE:', error.message);
    const request6 = {
      transaction: { reference: ref6 },
      order: { amount: 2000, currency: 'NGN', description: 'UAT Test - Incomplete Account', country: 'NGA', amounttype: 'EXACT' },
      customer: { account: { name: 'EBUNLOMO OLUMOWO', number: '123', expiry: { hours: 1 } } }
    };
    results.push({ scenario: 'Reallocate - Incomplete Account', request: request6, response: error.message, status: 'FAILURE' });
  }

  // Test 7: Failure with duplicate reference
  console.log('\nTest 7: Account reallocation failure using duplicate reference');
  try {
    const request7 = {
      transaction: { reference: reallocatedRef },
      order: {
        amount: 2000,
        currency: 'NGN',
        description: 'UAT Test - Duplicate Ref Reallocation',
        country: 'NGA',
        amounttype: 'EXACT'
      },
      customer: {
        account: {
          name: 'EBUNLOMO OLUMOWO',
          number: createdAccountNumber || '1234567890',
          expiry: { hours: 1 }
        }
      }
    };
    console.log('REQUEST:', JSON.stringify(request7, null, 2));
    
    const response7 = await reallocateVirtualAccount({
      accountNumber: createdAccountNumber || '1234567890',
      newReference: reallocatedRef!,
      amount: 2000,
      customerName: 'EBUNLOMO OLUMOWO',
      description: 'UAT Test - Duplicate Ref Reallocation'
    });
    console.log('RESPONSE:', JSON.stringify(response7, null, 2));
    results.push({ scenario: 'Reallocate - Duplicate Reference', request: request7, response: response7, status: 'SUCCESS' });
  } catch (error: any) {
    console.log('EXPECTED FAILURE:', error.message);
    const request7 = {
      transaction: { reference: reallocatedRef },
      order: { amount: 2000, currency: 'NGN', description: 'UAT Test - Duplicate Ref Reallocation', country: 'NGA', amounttype: 'EXACT' },
      customer: { account: { name: 'EBUNLOMO OLUMOWO', number: createdAccountNumber || '1234567890', expiry: { hours: 1 } } }
    };
    results.push({ scenario: 'Reallocate - Duplicate Reference', request: request7, response: error.message, status: 'FAILURE' });
  }

  // ========================================
  // DEACTIVATE TESTS
  // ========================================
  console.log('\n--- DEACTIVATE ACCOUNT TESTS ---\n');

  // Test 8: Successful deactivation
  console.log('Test 8: Account deactivation successful using valid account number');
  try {
    const request8 = {
      customer: {
        account: {
          number: createdAccountNumber || '1234567890'
        }
      }
    };
    console.log('REQUEST:', JSON.stringify(request8, null, 2));
    
    const response8 = await deactivateVirtualAccount(createdAccountNumber || '1234567890');
    console.log('RESPONSE:', JSON.stringify(response8, null, 2));
    results.push({ scenario: 'Deactivate - Valid', request: request8, response: response8, status: 'SUCCESS' });
  } catch (error: any) {
    console.log('ERROR:', error.message);
    results.push({ scenario: 'Deactivate - Valid', request: {}, response: error.message, status: 'ERROR' });
  }

  // Test 9: Failure with invalid account number
  console.log('\nTest 9: Account deactivation failure using incomplete account number');
  try {
    const request9 = {
      customer: {
        account: {
          number: '999'
        }
      }
    };
    console.log('REQUEST:', JSON.stringify(request9, null, 2));
    
    const response9 = await deactivateVirtualAccount('999');
    console.log('RESPONSE:', JSON.stringify(response9, null, 2));
    results.push({ scenario: 'Deactivate - Invalid Account', request: request9, response: response9, status: 'SUCCESS' });
  } catch (error: any) {
    console.log('EXPECTED FAILURE:', error.message);
    const failedRequest9 = { customer: { account: { number: '999' } } };
    results.push({ scenario: 'Deactivate - Invalid Account', request: failedRequest9, response: error.message, status: 'FAILURE' });
  }

  // ========================================
  // REACTIVATE TESTS
  // ========================================
  console.log('\n--- REACTIVATE ACCOUNT TESTS ---\n');

  // Test 10: Successful reactivation
  console.log('Test 10: Account reactivation successful using valid account number');
  try {
    const request10 = {
      customer: {
        account: {
          number: createdAccountNumber || '1234567890'
        }
      }
    };
    console.log('REQUEST:', JSON.stringify(request10, null, 2));
    
    const response10 = await reactivateVirtualAccount(createdAccountNumber || '1234567890');
    console.log('RESPONSE:', JSON.stringify(response10, null, 2));
    results.push({ scenario: 'Reactivate - Valid', request: request10, response: response10, status: 'SUCCESS' });
  } catch (error: any) {
    console.log('ERROR:', error.message);
    results.push({ scenario: 'Reactivate - Valid', request: {}, response: error.message, status: 'ERROR' });
  }

  // Test 11: Failure with invalid account number
  console.log('\nTest 11: Account reactivation failure using invalid account number');
  try {
    const request11 = {
      customer: {
        account: {
          number: 'INVALID123'
        }
      }
    };
    console.log('REQUEST:', JSON.stringify(request11, null, 2));
    
    const response11 = await reactivateVirtualAccount('INVALID123');
    console.log('RESPONSE:', JSON.stringify(response11, null, 2));
    results.push({ scenario: 'Reactivate - Invalid Account', request: request11, response: response11, status: 'SUCCESS' });
  } catch (error: any) {
    console.log('EXPECTED FAILURE:', error.message);
    const failedRequest11 = { customer: { account: { number: 'INVALID123' } } };
    results.push({ scenario: 'Reactivate - Invalid Account', request: failedRequest11, response: error.message, status: 'FAILURE' });
  }

  // ========================================
  // CONFIRM PAYMENT TESTS
  // ========================================
  console.log('\n--- CONFIRM PAYMENT TESTS ---\n');

  // Test 12: Successful payment confirmation
  console.log('Test 12: Payment confirmation using valid reference');
  try {
    const request12 = {
      method: 'GET',
      endpoint: `${PSB_BASE_URL}/status/${successfulReference || 'TEST_REF'}`,
      headers: {
        'Authorization': 'Bearer {token}'
      }
    };
    console.log('REQUEST:', JSON.stringify(request12, null, 2));
    
    const response12 = await confirmPayment(successfulReference || 'TEST_REF');
    console.log('RESPONSE:', JSON.stringify(response12, null, 2));
    results.push({ scenario: 'Confirm Payment - Valid Reference', request: request12, response: response12, status: response12.code === '00' ? 'SUCCESS' : (response12.parseError ? 'ENDPOINT_ERROR' : 'FAILURE') });
  } catch (error: any) {
    console.log('ERROR:', error.message);
    results.push({ scenario: 'Confirm Payment - Valid Reference', request: {}, response: error.message, status: 'ERROR' });
  }

  // Test 13: Failed payment confirmation with invalid reference
  console.log('\nTest 13: Payment confirmation failure using invalid reference');
  try {
    const request13 = {
      method: 'GET',
      endpoint: `${PSB_BASE_URL}/status/INVALID_REFERENCE_12345`,
      headers: {
        'Authorization': 'Bearer {token}'
      }
    };
    console.log('REQUEST:', JSON.stringify(request13, null, 2));
    
    const response13 = await confirmPayment('INVALID_REFERENCE_12345');
    console.log('RESPONSE:', JSON.stringify(response13, null, 2));
    results.push({ scenario: 'Confirm Payment - Invalid Reference', request: request13, response: response13, status: response13.code === '00' ? 'SUCCESS' : (response13.parseError ? 'ENDPOINT_ERROR' : 'FAILURE') });
  } catch (error: any) {
    console.log('ERROR:', error.message);
    results.push({ scenario: 'Confirm Payment - Invalid Reference', request: {}, response: error.message, status: 'ERROR' });
  }

  // ========================================
  // SUMMARY
  // ========================================
  console.log('\n========================================');
  console.log('TEST SUMMARY');
  console.log('========================================\n');
  
  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.scenario}: ${r.status}`);
  });

  console.log('\n========================================');
  console.log('DETAILED RESULTS (JSON)');
  console.log('========================================\n');
  console.log(JSON.stringify(results, null, 2));
}

runTests().catch(console.error);
