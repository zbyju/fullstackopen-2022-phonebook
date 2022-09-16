const morgan = require("morgan");
const express = require("express");
const app = express();

app.use(express.json());

app.use(morgan("tiny"));

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

function generateId() {
  return Math.floor(Math.random() * 10000000);
}

app.get("/info", (req, res) => {
  res.send(
    `<p>Phonebook has info about ${
      persons.length
    } people.</p><p>${new Date()}</p>`
  );
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const person = persons.find((p) => p.id == req.params.id);

  if (!person) {
    return res
      .status(404)
      .send({ msg: "Could not find person with id: " + req.params.id });
  }
  return res.send({ msg: "Person found", person });
});

app.post("/api/persons", (req, res) => {
  const person = req.body;
  person.id = generateId();
  if (!person.name || person.name === "") {
    return res.status(400).send({ msg: "No name was specified" });
  }
  if (!person.number || person.number === "") {
    return res.status(400).send({ msg: "No number was specified" });
  }
  const existingPerson = persons.find((p) => p.name === person.name);
  if (existingPerson !== undefined) {
    return res.status(400).send({ msg: "Name must be unique" });
  }

  persons.push(person);
  return res.status(201).send({
    msg: "Created a new person",
    person: person,
  });
});

app.delete("/api/persons/:id", (req, res) => {
  persons = persons.filter((p) => p.id != req.params.id);

  res.status(204).end();
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
