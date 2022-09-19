require("dotenv").config();
const morgan = require("morgan");
const cors = require("cors");
const express = require("express");
const app = express();

const Person = require("./models/person");

app.use(express.json());
app.use(cors());

// Make frontend accessible
app.use(express.static("src/build"));

morgan.token("body", function (req, res) {
  if (req.method !== "POST") return " ";
  return JSON.stringify(req.body);
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.get("/info", (req, res) => {
  Person.find({}).then((persons) => {
    res.send(
      `<p>Phonebook has info about ${
        persons.length
      } people.</p><p>${new Date()}</p>`
    );
  });
});

app.get("/api/persons", (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.json(persons);
    })
    .catch((err) => next(err));
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((err) => next(err));
});

app.put("/api/persons/:id", (req, res, next) => {
  const person = req.body;
  Person.findByIdAndUpdate(req.params.id, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((err) => next(err));
});

app.post("/api/persons", (req, res, next) => {
  const person = req.body;
  if (!person.name || person.name === "") {
    return res.status(400).send({ msg: "No name was specified" });
  }
  if (!person.number || person.number === "") {
    return res.status(400).send({ msg: "No number was specified" });
  }

  const newPerson = new Person(person);
  newPerson
    .save()
    .then((person) => {
      res.json(person);
    })
    .catch((err) => next(err));
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((err) => next(err));
});

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (
    error.name === "MongoServerError" &&
    error.message.includes("E11000")
  ) {
    return response.status(400).json({ error: "duplicate record" });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
