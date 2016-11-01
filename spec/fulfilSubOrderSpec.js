"use strict";

const fulfilSubOrder = require('../lib/actions/fulfilSubOrder.js');
const fulfilSubOrderResponse = require('./fixtures/fulfilSubOrderResponse.json');
const fulfilSubOrderRequest  = require('./fixtures/getOrderReferenceResponse.json');
// disable requests to the outside world
const nock = require("nock");
nock.recorder.rec();
// nock.disableNetConnect();
// silence console logs
// console.log = () => {};

describe("Fulfills a sub order", () => {

  beforeEach(() => {
    this.message = {
      body: {
        currentMessage: fulfilSubOrderRequest
      }
    }

    this.config = {
      host:   "https://vendors-staging.herokuapp.com",
      apiKey: "abc123"
    }
  });

  describe("Valid request", () => {
    beforeEach((done) => {
      this.acknowledgeSubOrderRequest = nock('https://vendors-staging.herokuapp.com:443', 
                                          {"encodedQueryParams":true})
                                      .patch('/api/v1/fulfilments', {
                                         "data": {
                                            "attributes": {
                                              "acknowledge": true
                                            },
                                            "type": "sub-orders",
                                            "id": 610
                                          }
                                      });

      this.self = {
        emit() { done(); }
      };

      spyOn(this.self, "emit").and.callThrough();

      this.fulfilSubOrderRequest = this.fulfilSubOrderRequest.reply(200, fulfilSubOrderResponse);

      fulfilSubOrder.process.call(this.self, this.message, this.config);
    });

    it("sends a correct request to a correct VMS endpoint", () => {
      expect(this.fulfilSubOrderRequest.isDone()).toBe(true);
    });

    it("emits valid JSON API compliant data", () => {
      expect(this.self.emit).toHaveBeenCalledTimes(1);
      let passedMessageVerb = this.self.emit.calls.argsFor(0)[0];
      let passedMessageBody = this.self.emit.calls.argsFor(0)[1].body;
      expect(passedMessageVerb).toEqual('data');
      expect(passedMessageBody).toEqual({ currentMessage: fulfilSubOrderResponse,
                                          vms: {
                                            fulfilSubOrder: {
                                              vmsSubOrderFulfilment: fulfilSubOrderResponse
                                            }
                                          }
                                        });
    });
  });

  describe("Invalid request", () => {
    beforeEach((done) => {
      this.self = {
        emit() { done(); }
      };

      this.fulfilSubOrderRequest = nock('https://vendors-staging.herokuapp.com:443', 
                                          {"encodedQueryParams":true})
                                      .patch('/api/v1/fulfilments');

      this.message = {
        body: {
          "data": "this is invalid data and will raise a rebound"
        }
      }

      spyOn(this.self, "emit").and.callThrough();

      this.fulfilSubOrderRequest = this.fulfilSubOrderRequest.reply(404);

      fulfilSubOrder.process.call(this.self, this.message, this.config);
    });

    it("emits a rebound", () => {
      expect(this.self.emit).toHaveBeenCalledTimes(1);
      let emittedVerb = this.self.emit.calls.argsFor(0)[0];
      expect(emittedVerb).toEqual('rebound');
    });
  });
});