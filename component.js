{
  "title": "Vendor Management System API V1",
  "description": "Vendor Management System API component for the elastic.io platform",
  "credentials": {
    "fields": {
      "host": {
        "label": "Host",
        "required": true,
        "viewClass": "TextFieldView"
      },
      "apiKey": {
        "label": "API Key",
        "required": true,
        "viewClass": "TextFieldView"
      }
    }
  },
  "actions": {
    "acknowledgeSubOrder": {
      "main": "./lib/actions/acknowledgeSubOrder.js",
      "title": "Acknowledges a sub order by id"
    },
    "getSubOrderRecordByReference": {
      "main": "./lib/actions/getSubOrderRecordByReference.js",
      "title": "Retrieves a sub order by order reference"
    }
  }
}