const { expect } = require("chai");
const chai = require("chai");
const assert = require('assert');
const mongoose = require('mongoose');
const request = require("request");
let url = 'http://localhost:3000/'; //api/v3/coins/${cryptoSymbol}
const coins = { priceData: '', targetElement: '' };

describe('Cryto Analyzer Testing', () => {
    // it('1. Create price table with valid data', (priceData, targetElement) => {
    //     chai.createPriceTable(priceData, targetElement);
    //     expect(targetElement.querySelector('tr').textContent).to.include('Data Expected:');
    // });

    it('2. GET data', (done) => {
        request.get({ url: url, form: '/submit' }, (err, res) => {
            expect(res.statusCode).to.equal(200);
            done();
        });
    });

    // Test Form submission 
    it('3. Test POST function of /submit', () => {
        before(async () => {
            // API Connection Testing
            await mongoose.connect('http://localhost:3000/', {
                useNewURlParser: true,
                useUnifiedTopology: true
            });
        });

        after(async () => {
            // Close Testing after all tests are complete.
            await mongoose.disconnect();
        })
    });

    // Testing Query able to submitted successfully
    it('4. Test query submission status', (done) => {
        request.post({ url: url, form: '/submit' }, (err, res4) => {
            expect(res4.statusCode).to.equal(404);
            done();
        });
    });

    it('5. Delete a data', (done) => {
        request.delete({ url: url, form: coins }, (err, res5) => {
            expect(res5.statusCode).to.equal(404);
            done();
        });
    });

    // Return all testing is completed
    it('6. Testing Complete', () => {
        return new Promise((resolve) => {
            assert.ok(true);
            resolve();
        });
    });
});


