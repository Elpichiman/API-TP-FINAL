import express from 'express';  
import fs from 'fs'; 
import path from 'path'; 
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bodyParser from 'body-parser'; 

const app = express();
const bodyP = bodyParser.json();
app.use(bodyP);

const port = 3000;

const leerDatos = () => {
  try {
    const datos = fs.readFileSync("./db.json");
    return JSON.parse(datos);
  } catch (error) {
    console.log(error);
  }
}

const escribir = (datos) => {
  try {
    fs.writeFileSync("./db.json", JSON.stringify(datos, null, 2));
  } catch (error) {
    console.log(error);
  }
}

// Aerolineas
app.get('/ListarAerolineas', (req, res) => {
  const datos = leerDatos();
  res.json(datos.aerolineas);
});

app.get('/BuscarAerolinea/:id', (req, res) => {
  const datos = leerDatos();
  const id = parseInt(req.params.id);
  const aerolinea = datos.aerolineas.find((aerolinea) => aerolinea.id === id);
  if (aerolinea) {
    res.json(aerolinea);
  } else {
    res.status(404).send("Aerolinea no encontrada.");
  }
});

// Agregar una nueva aerolínea
app.post('/AgregarAerolinea', (req, res) => {
  const nuevaAerolinea = req.body;  
  const dbPath = './db.json';  
  
  fs.readFile(dbPath, 'utf8', (err, data) => {
      if (err) {
          return res.status(500).send('Error al leer el archivo.');
      }
      
      const db = JSON.parse(data);  
      nuevaAerolinea.id = db.aerolineas.length + 1;  
      db.aerolineas.push(nuevaAerolinea);  

      fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
          if (err) {
              return res.status(500).send('Error al guardar el archivo.');
          }
          res.status(201).json(nuevaAerolinea);  
      });
  });
});

// Pasajeros
app.post('/SubirPasajero', (req, res) => {
  const nuevoPasajero = req.body;  
  const dbPath = './db.json';  
  
  fs.readFile(dbPath, 'utf8', (err, data) => {
      if (err) {
          return res.status(500).send('Error al leer el archivo.');
      }
      
      const db = JSON.parse(data);  
      nuevoPasajero.id = db.pasajeros.length + 1;  
      db.pasajeros.push(nuevoPasajero);  

      fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
          if (err) {
              return res.status(500).send('Error al guardar el archivo.');
          }
          res.status(201).json(nuevoPasajero);  
      });
  });
});
//Consulta de pasajeros
app.get('/ListarPasajeros', (req, res) => {
  const datos = leerDatos();
  res.json(datos.pasajeros);
});
//Consulta de vuelo
app.get('/ListarVuelos', (req, res) => {
  const datos = leerDatos();
  res.json(datos.vuelos);
});

app.get('/BuscarVuelo/:id', (req, res) => {
  const datos = leerDatos();
  const id = parseInt(req.params.id);
  const vuelo = datos.vuelos.find((vuelo) => vuelo.id === id);
  if (vuelo) {
    res.json(vuelo);
  } else {
    res.status(404).send("Vuelo no encontrado.");
  }
});

// Agregar un nuevo vuelo
app.post('/AgregarVuelo', (req, res) => {
  const nuevoVuelo = req.body;  
  const dbPath = './db.json';  
  
  fs.readFile(dbPath, 'utf8', (err, data) => {
      if (err) {
          return res.status(500).send('Error al leer el archivo.');
      }
      
      const db = JSON.parse(data);  
      
      // Verificar si el aerolinea_id es válido
      const aerolineaExistente = db.aerolineas.find(aerolinea => aerolinea.id === nuevoVuelo.aerolinea_id);
      if (!aerolineaExistente) {
          return res.status(400).send('El aerolinea_id proporcionado no es válido.');
      }

      // Asignar un nuevo id al vuelo
      nuevoVuelo.id = db.vuelos.length + 1;  
      db.vuelos.push(nuevoVuelo);  

      fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
          if (err) {
              return res.status(500).send('Error al guardar el archivo.');
          }
          res.status(201).json(nuevoVuelo);  
      });
  });
});


// Asientos
app.get('/ListarAsientos', (req, res) => {
  const datos = leerDatos();
  res.json(datos.asientos);
});

app.get('/BuscarAsiento/:id', (req, res) => {
  const datos = leerDatos();
  const id = parseInt(req.params.id);
  const asiento = datos.asientos.find((asiento) => asiento.id === id);
  if (asiento) {
    res.json(asiento);
  } else {
    res.status(404).send("Asiento no encontrado.");
  }
});
// Agregar un asiento
app.post('/AgregarAsiento', (req, res) => {
  const nuevoAsiento = req.body;  
  const dbPath = './db.json';  
  
  fs.readFile(dbPath, 'utf8', (err, data) => {
      if (err) {
          return res.status(500).send('Error al leer el archivo.');
      }
      
      const db = JSON.parse(data);  
      
      // Verificar si el vuelo_id es válido
      const vueloExistente = db.vuelos.find(vuelo => vuelo.id === nuevoAsiento.vuelo_id);
      if (!vueloExistente) {
          return res.status(400).send('El vuelo_id proporcionado no es válido.');
      }

      nuevoAsiento.id = db.asientos.length + 1;  
      db.asientos.push(nuevoAsiento);  

      fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
          if (err) {
              return res.status(500).send('Error al guardar el archivo.');
          }
          res.status(201).json(nuevoAsiento);  
      });
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});