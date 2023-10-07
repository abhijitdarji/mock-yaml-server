# Mock YAML Server

This is a simple API server that uses [faker-js](https://github.com/faker-js/faker) to generate fake data based on a yaml schema file.
It will read all yaml schema definition files in the current directory and serve them as a REST API. It includes Swagger UI for easy testing.
CRUD operations are supported for all defined resources by using json file storage.

## Usage

### Install

```bash
npm install -g mock-yaml-server
```

### Run

```bash
mock-yaml-server
```
CLI options:

```bash
Usage: mock-yaml-server [options]
Options:
  -h, --help        Show help                                    [boolean]
      --version     Show version number                          [boolean]
  -p, --port        Port number                            [default: 3000]
  -f, --folder      Folder to watch         [default: "current directory"]
  -d, --dark-theme  Swagger UI dark theme        [boolean][default: false]
```

## Schema definition


### Definition

The schema file must be a valid yaml file with the following structure:

```yaml
resource: # resource name that will be used in the url path for the api
seed: # number of records to generate when the server starts
headers: # optional headers to include in the response
  - <header name>: <header value>
cookies: # optional cookies to include in the response
  - name: <cookie name>
    value: <cookie value>
    options: # optional cookie options
      domain: <cookie domain>
      path: <cookie path>
      secure: <cookie secure flag>
      httpOnly: <cookie httpOnly flag>
      expires: <cookie expiration date>
      maxAge: <cookie maxAge in milliseconds>
      sameSite: <cookie sameSite flag
properties: # list of properties to generate
  <property name>:
    type: # faker-js method name or one of the following special types (compose, json, array, eval)
    input: # optional input for the faker-js method, required for compose, json, eval types
    options: # optional options for the faker-js method
    count: # optional number of items to generate for array type
    items: # optional schema definition for array type
```

### Sample schema file named `users.yaml`:

```yaml
resource: users # resource name that will be used in the url path for the api
seed: 5 # number of records to generate when the server starts
properties:
  firstName:
    type: person.firstName # faker-js method name
  lastName:
    type: person.lastName
  email:
    type: internet.email
  phone:
    type: phone.number
  zodiac:
    type: person.zodiacSign
  avatar:
    type: image.avatar
  address:
    type: compose # compose multiple faker-js methods together to create a single value
    input:
      - type: location.streetAddress
        options:
          useFullAddress: true
      - ', '
      - type: location.city
      - ', '
      - type: location.state
        options:
          abbreviated: true
  mobileDeviceOSType:
    type: helpers.arrayElement
    input: # array of possible values only one will be selected
      - iOS
      - Android
      - Windows
      - Blackberry
      - Symbian
      - Other
  pets:
    type: helpers.arrayElements
    input: # array of possible values, a random number of values will be selected between min and max
      - cat
      - dog
      - fish
      - bird
      - rabbit
    options:
      min: 1
      max: 3
  employeeNumber:
    type: helpers.fromRegExp
    input: '[A-Z]{2}-[0-9]{6}' # regular expression
  birthDate:
    type: date.birthdate
  favoriteColor:
    type: color.human
  todoList:
    type: json # json object
    input: |
      {
          "foo": "bar"
      }
  workExperience:
    type: json
    input:
      company: 'Acme Inc.'
      position: 'Software Engineer'
      startDate: '2015-01-01'
      endDate: '2017-01-01'
  websites:
    type: array
    count: 3
    items:
      properties:
        url:
          type: internet.url
        name:
          type: company.name
  vehicles:
    type: array
    count: 2
    items:
      type: compose
      input:
        - type: helpers.fromRegExp
          input: '20[0-2]{2}'
        - ' - '
        - type: vehicle.manufacturer
        - ' '
        - type: vehicle.model
  addressHistory:
    type: array
    items:
      - properties:
          home:
            type: location.streetAddress
      - count: 2
        properties:
          work:
            type: location.streetAddress
      - type: json
        input: |
          {
            "temporary": "Some temporary address"
          }
  wordList:
    type: array
    count: 5
    items:
      type: lorem.words
      options: 5 # word count
  notes:
    type: lorem.paragraphs
    input: 2 # number of paragraphs
  randomPassword:
    type: eval
    input: |
      (function() {
        const length = 16;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

        let retVal = '';
        for (let i = 0, n = charset.length; i < length; ++i) {
          retVal += charset.charAt(Math.floor(Math.random() * n));
        }

        return retVal;
      })();
  randomNumbers:
    type: eval
    input: 'Array.from({length: 5}, () => Math.floor(Math.random() * 100))'

```

## Property Types

1. **faker-js method** name
2. **compose** - compose multiple faker-js methods together to create a single value
3. **json** - json object
4. **array** - array of items
5. **eval** - evaluate a javascript expression

### Get value from faker-js

```yaml
firstName:
    type: person.firstName
```
Optionally you can specify input and options for the faker-js method. input is the first argument for the method and options is the second argument.

```yaml
pets:
    type: helpers.arrayElements
    input: # array of possible values, a random number of values will be selected between min and max
      - cat
      - dog
      - fish
      - bird
      - rabbit
    options:
      min: 1
      max: 3
```

### Compose multiple faker-js methods together

```yaml
address:
    type: compose # compose multiple faker-js methods together to create a single value
    input:
      - type: location.streetAddress
        options:
          useFullAddress: true
      - ', '
      - type: location.city
      - ', '
      - type: location.state
        options:
          abbreviated: true
```

### JSON object

```yaml
workExperience:
    type: json
    input:
      company: 'Acme Inc.'
      position: 'Software Engineer'
      startDate: '2015-01-01'
      endDate: '2017-01-01'
```
Or you can use a multiline string

```yaml
workExperience:
    type: json
    input: |
      {
        "company": "Acme Inc.",
        "position": "Software Engineer",
        "startDate": "2015-01-01",
        "endDate": "2017-01-01"
      }
```

### Array of items

Generate array of objects
```yaml
websites:
    type: array
    count: 3
    items:
      properties:
        url:
          type: internet.url
        name:
          type: company.name
```
or generate array of strings

```yaml
wordList:
    type: array
    count: 5
    items:
      type: lorem.words
      options: 5 # word count
```
or control each item in array

```yaml
addressHistory:
type: array
items:
    - properties:
        home:
          type: location.streetAddress
    - count: 2
      properties:
        work:
          type: location.streetAddress
    - type: json
        input: |
        {
        "temporary": "Some temporary address"
        }
```

### Evaluate a javascript expression

```yaml
randomPassword:
    type: eval
    input: |
      (function() {
        const length = 16;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

        let retVal = '';
        for (let i = 0, n = charset.length; i < length; ++i) {
          retVal += charset.charAt(Math.floor(Math.random() * n));
        }

        return retVal;
      })();
```
or generate an array of random numbers

```yaml
randomNumbers:
    type: eval
    input: 'Array.from({length: 5}, () => Math.floor(Math.random() * 100))'
```

## Dev Container

Add user to npm registry before publishing
  
```bash
npm adduser --registry http://localnpm:4873
```