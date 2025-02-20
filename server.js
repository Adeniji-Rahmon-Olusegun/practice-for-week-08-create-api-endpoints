const http = require('http');

const dogs = [
  {
    dogId: 1,
    name: "Fluffy",
    age: 2
  }
];

let nextDogId = 2;

function getNewDogId() {
  const newDogId = nextDogId;
  nextDogId++;
  return newDogId;
}

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // assemble the request body
  let reqBody = "";
  req.on("data", (data) => {
    reqBody += data;
  });

  req.on("end", () => { // request is finished assembly the entire request body
    // Parsing the body of the request depending on the Content-Type header
    if (reqBody) {
      switch (req.headers['content-type']) {
        case "application/json":
          req.body = JSON.parse(reqBody);
          break;
        case "application/x-www-form-urlencoded":
          req.body = reqBody
            .split("&")
            .map((keyValuePair) => keyValuePair.split("="))
            .map(([key, value]) => [key, value.replace(/\+/g, " ")])
            .map(([key, value]) => [key, decodeURIComponent(value)])
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {});
          break;
        default:
          break;
      }
      console.log(req.body);
    }

    /* ======================== ROUTE HANDLERS ======================== */

    // GET /dogs
    if (req.method === 'GET' && req.url === '/dogs') {
      // Your code here
      let resBody = JSON.stringify(dogs, null, 4);
      res.setHeader("Content-Type", "application/json");
      res.write(resBody);

      return res.end();
    }

    // GET /dogs/:dogId
    if (req.method === 'GET' && req.url.startsWith('/dogs/')) {
      const urlParts = req.url.split('/'); // ['', 'dogs', '1']
      if (urlParts.length === 3) {
        const dogId = urlParts[2];
        // Your code here
        let dog = dogs.find(dog => dog.dogId === Number(dogId));

        res.statusCode = 201;
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify(dog, null, 4));
      }

      return res.end();
    }

    // POST /dogs
    if (req.method === 'POST' && req.url === '/dogs') {
      const { name, age } = req.body;
      // Your code here
      let dogId = getNewDogId();

      let obj = {
        dogId: dogId,
        name: name,
        age: Number(age)
      }

      dogs.push(obj);

      res.statusCode = 302;
      res.setHeader("Location", `/dogs/${dogId}`);

      //res.write(JSON.stringify(dogs, null, 4));

      return res.end();
    }

    // PUT or PATCH /dogs/:dogId
    if ((req.method === 'PUT' || req.method === 'PATCH')  && req.url.startsWith('/dogs/')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 3) {
        const dogId = urlParts[2];
        // Your code here
        let dogIndex = dogs.findIndex(dog => dog.dogId === Number(dogId));

        dogs[dogIndex].name = req.body.name;
        dogs[dogIndex].age = Number(req.body.age);

        res.statusCode = 201;
        res.setHeader("Content-Type", "application/json");
        
        let body = JSON.stringify(dogs[dogIndex]);
        //console.log(body);
        res.write(body);
      }
      return res.end();
    }

    // DELETE /dogs/:dogId
    if (req.method === 'DELETE' && req.url.startsWith('/dogs/')) {
      const urlParts = req.url.split('/');
      if (urlParts.length === 3) {
        const dogId = urlParts[2];
        // Your code here
        let dogIndex = dogs.findIndex(dog => dog.dogId === Number(dogId));
        let dog = dogs.splice(dogIndex, 1);

        res.setHeader("Content-Type", "application/json");
        let resB = JSON.stringify({ message: 'Successfully deleted'});
        res.write(resB);
      }
      
      return res.end();
    }

    // No matching endpoint
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    return res.end('Endpoint not found');
  });

});


if (require.main === module) {
    const port = 8000;
    server.listen(port, () => console.log('Server is listening on port', port));
} else {
    module.exports = server;
}