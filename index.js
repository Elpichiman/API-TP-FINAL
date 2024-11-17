import express from 'express';  
import fs from 'fs'; 
import path from 'path'; 
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bodyParser from 'body-parser'; 

// Crea una instancia de la aplicación Express
const app = express(); 
// Middleware para parsear el cuerpo de las solicitudes como JSON
const bodyP = bodyParser.json(); 
// Usa el middleware para procesar las solicitudes JSON
app.use(bodyP); 

// Define el puerto en el que se ejecutará el servidor
const port = 3000; 

// Función para leer datos del archivo db.json
const leerDatos = () => {
  try {
    // Lee el archivo db.json
    const datos = fs.readFileSync("./db.json"); 
    // Parsea y retorna los datos en formato JSON
    return JSON.parse(datos); 
  } catch (error) {
    console.log(error); // Manejo de errores
  }
}

// Función para escribir datos en el archivo db.json
const escribir = (datos) => {
  try {
    // Escribe los datos en formato JSON en el archivo db.json
    fs.writeFileSync("./db.json", JSON.stringify(datos, null, 2)); 
  } catch (error) {
    console.log(error); // Manejo de errores
  }
}

// ------------------- AEROLINEAS -----------------------

// Endpoint para listar todas las aerolíneas
app.get('/ListarAerolineas', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  res.json(datos.aerolineas); // Responde con la lista de aerolíneas en formato JSON
});

// Endpoint para buscar una aerolínea por ID
app.get('/BuscarAerolinea/:id', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const id = parseInt(req.params.id); // Obtiene el ID de los parámetros de la solicitud
  const aerolinea = datos.aerolineas.find(a => a.id === id); // Busca la aerolínea por ID
  if (aerolinea) {
    res.json(aerolinea); // Responde con la aerolínea encontrada
  } else {
    res.status(404).send("Aerolinea no encontrada."); // Responde con error 404 si no se encuentra
  }
});

// Endpoint para agregar una nueva aerolínea
app.post('/AgregarAerolinea', async (req, res) => {
  const nuevaAerolinea = req.body; // Obtiene la nueva aerolínea del cuerpo de la solicitud

  // Verificar que los campos requeridos estén presentes
  if (!nuevaAerolinea.nombre || !nuevaAerolinea.gmail || !nuevaAerolinea.numero_telefono) {
    return res.status(400).json({ error: 'Los campos nombre, gmail y número de teléfono son requeridos.' });
  }

  const datos = await leerDatos(); // Lee los datos del archivo

  // Asigna un nuevo ID a la aerolínea
  nuevaAerolinea.id = datos.aerolineas.length ? datos.aerolineas[datos.aerolineas.length - 1].id + 1 : 1;
  nuevaAerolinea.estado = "ACTIVO"; // Estado inicial de la aerolínea
  datos.aerolineas.push(nuevaAerolinea); // Agrega la nueva aerolínea a la lista

  await escribir(datos); // Escribe los datos actualizados en el archivo
  res.status(201).json(nuevaAerolinea); // Responde con la nueva aerolínea creada
});

// Endpoint para modificar una aerolínea por ID
app.put('/ModificarAerolinea/:id', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const id = parseInt(req.params.id); // Obtiene el ID de los parámetros de la solicitud
  const aerolinea = datos.aerolineas.find(a => a.id === id); // Busca la aerolínea por ID
  if (aerolinea) {
    Object.assign(aerolinea, req.body); // Modifica la aerolínea con los nuevos datos
    await escribir(datos); // Escribe los datos actualizados en el archivo
    res.json(aerolinea); // Responde con la aerolínea modificada
  } else {
    res.status(404).send('Aerolínea no encontrada.'); // Responde con error 404 si no se encuentra
  }
});

// Endpoint para cambiar el estado de una aerolínea por ID
app.delete('/EstadoAerolinea/:id', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const id = parseInt(req.params.id); // Obtiene el ID de los parámetros de la solicitud
  const aerolinea = datos.aerolineas.find(a => a.id === id ); // Busca la aerolínea por ID
  
  if (aerolinea) {
    // Cambia el estado de la aerolínea entre ACTIVO e INACTIVO
    aerolinea.estado = (aerolinea.estado === "INACTIVO") ? "ACTIVO" : "INACTIVO"; 
    await escribir(datos); // Escribe los datos actualizados en el archivo
    res.json(aerolinea); // Responde con la aerolínea actualizada
  } else {
    res.status(404).send('Aerolínea no encontrada.'); // Responde con error 404 si no se encuentra
  }
});

// ------------------- PASAJEROS -----------------------

// Endpoint para subir un nuevo pasajero
app.post('/SubirPasajero', async (req, res) => {
  const nuevoPasajero = req.body; // Obtiene el nuevo pasajero del cuerpo de la solicitud
  const datos = await leerDatos(); // Lee los datos del archivo

  // Verifica si ya existe un pasajero con el mismo DNI
  const pasajeroExistente = datos.pasajeros.find(p => p.dni === nuevoPasajero.dni);
  if (pasajeroExistente) {
    return res.status(400).send('Ya existe un pasajero con el mismo DNI.'); // Responde con error si el DNI ya existe
  }

  // Asigna un nuevo ID al pasajero
  nuevoPasajero.id = datos.pasajeros.length ? datos.pasajeros[datos.pasajeros.length - 1].id + 1 : 1;
  nuevoPasajero.estado = "ACTIVO"; // Estado inicial
  datos.pasajeros.push(nuevoPasajero); // Agrega el nuevo pasajero a la lista
  await escribir(datos); // Escribe los datos actualizados en el archivo
  res.status(201).json(nuevoPasajero); // Responde con el nuevo pasajero creado
});

// Endpoint para listar todos los pasajeros
app.get('/ListarPasajeros', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  res.json(datos.pasajeros); // Responde con la lista de pasajeros en formato JSON
});

// Endpoint para buscar un pasajero por DNI
app.get('/BuscarPasajero/:dni', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const dni = req.params.dni; // Obtiene el DNI de los parámetros de la solicitud
  const pasajero = datos.pasajeros.find(p => p.dni === dni); // Busca el pasajero por DNI
  if (pasajero) {
    res.json(pasajero); // Responde con el pasajero encontrado
  } else {
    res.status(404).send('Pasajero no encontrado.'); // Responde con error 404 si no se encuentra
  }
});
// Endpoint para buscar un pasajero por ID
app.get('/BuscarPasajero/:id', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const id = parseInt(req.params.id); // Obtiene el ID de los parámetros de la solicitud
  const pasajero = datos.pasajeros.find(p => p.id === id); // Busca el pasajero por ID
  if (pasajero) {
    res.json(pasajero); // Responde con el pasajero encontrado
  } else {
    res.status(404).send('Pasajero no encontrado.'); // Responde con error 404 si no se encuentra
  }
});

// Endpoint para modificar un pasajero por ID
app.put('/ModificarPasajero/:id', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const id = parseInt(req.params.id); // Obtiene el ID de los parámetros de la solicitud
  const pasajero = datos.pasajeros.find(p => p.id === id); // Busca el pasajero por ID
  if (pasajero) {
    Object.assign(pasajero, req.body); // Modifica el pasajero con los nuevos datos
    await escribir(datos); // Escribe los datos actualizados en el archivo
    res.json(pasajero); // Responde con el pasajero modificado
  } else {
    res.status(404).send('Pasajero no encontrado.'); // Responde con error 404 si no se encuentra
  }
});

// Endpoint para cambiar el estado de un pasajero por ID
app.delete('/EstadoPasajero/:id', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const id = parseInt(req.params.id); // Obtiene el ID de los parámetros de la solicitud
  const pasajero = datos.pasajeros.find(p => p.id === id); // Busca el pasajero por ID
  
  if (pasajero) {
    // Cambia el estado del pasajero entre ACTIVO e INACTIVO
    pasajero.estado = (pasajero.estado === "INACTIVO") ? "ACTIVO" : "INACTIVO"; 
    await escribir(datos); // Escribe los datos actualizados en el archivo
    res.json({ message: `El pasajero ha cambiado a ${pasajero.estado}` }); // Responde con el nuevo estado del pasajero
  } else {
    res.status(404).send('Pasajero no encontrado.'); // Responde con error 404 si no se encuentra
  }
});

// ------------------- AVIONES -----------------------
// Endpoint para listar todos los aviones
app.get('/ListarAviones', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  res.json(datos.aviones); // Responde con la lista de aviones en formato JSON
});

// Endpoint para buscar un avión por ID
app.get('/BuscarAvion/:id', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const id = parseInt(req.params.id); // Obtiene el ID de los parámetros de la solicitud
  const avion = datos.aviones.find(a => a.id === id); // Busca el avión por ID
  if (avion) {
    res.json(avion); // Responde con el avión encontrado
  } else {
    res.status(404).send('Avión no encontrado.'); // Responde con error 404 si no se encuentra
  }
});

// Endpoint para buscar un avión por modelo
app.get('/BuscarAvionPorModelo/:modelo', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const modelo = req.params.modelo; // Obtiene el modelo de los parámetros de la solicitud
  const avion = datos.aviones.find(a => a.modelo === modelo); // Busca el avión por modelo
  if (avion) {
    res.json(avion); // Responde con el avión encontrado
  } else {
    res.status(404).send('Avión no encontrado.'); // Responde con error 404 si no se encuentra
  }
});

// Endpoint para agregar un nuevo avión
app.post('/AgregarAvion', async (req, res) => {
  const nuevoAvion = req.body; // Obtiene el nuevo avión del cuerpo de la solicitud

  // Asegurarse de que se incluyen los campos requeridos
  if (!nuevoAvion.modelo || !nuevoAvion.capacidad || !nuevoAvion.aerolineaId) {
    return res.status(400).json({ error: 'El modelo, capacidad y aerolineaId son requeridos' });
  }

  const datos = await leerDatos(); // Lee los datos del archivo
  const aerolinea = datos.aerolineas.find(a => a.id === nuevoAvion.aerolineaId); // Busca la aerolínea correspondiente

  if (!aerolinea) {
    return res.status(404).json({ error: 'Aerolínea no encontrada' });
  }

  nuevoAvion.id = datos.aviones.length ? datos.aviones[datos.aviones.length - 1].id + 1 : 1; // Asigna un nuevo ID al avión
  datos.aviones.push(nuevoAvion); // Agrega el nuevo avión a la lista

  await escribir(datos); // Guarda los datos actualizados
  res.status(201).json(nuevoAvion); // Responde con el nuevo avión creado
});

// Endpoint para cambiar el estado de un avión entre "DISPONIBLE" y "AVERIADO" por ID
app.delete('/ModificarEstadoAvion/:id', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const id = parseInt(req.params.id); // Obtiene el ID de los parámetros de la solicitud
  const avion = datos.aviones.find(a => a.id === id); // Busca el avión por ID
  if (avion) {
    // Cambia el estado del avión entre "DISPONIBLE" y "AVERIADO"
    avion.estado = (avion.estado === "AVERIADO") ? "DISPONIBLE" : "AVERIADO";
    await escribir(datos); // Escribe los datos actualizados en el archivo
    res.json({ message: `El estado del avión ha cambiado a ${avion.estado}` }); // Responde con el nuevo estado del avión
  } else {
    res.status(404).send('Avión no encontrado.'); // Responde con error 404 si no se encuentra
  }
});

// ------------------- VUELOS -----------------------

// Endpoint para listar todos los vuelos
app.get('/ListarVuelos', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const vuelosConAviones = datos.vuelos.map(vuelo => {
    const avion = datos.aviones.find(a => a.id === vuelo.avionId); // Busca el avión asociado
    return {
      ...vuelo,
      avionModelo: avion ? avion.modelo : 'Desconocido' // Agrega el modelo del avión al vuelo
    };
  });

  res.json(vuelosConAviones); // Responde con la lista de vuelos junto con los modelos de aviones
});

// Endpoint para buscar un vuelo por ID
app.get('/BuscarVuelo/:id', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const id = parseInt(req.params.id); // Obtiene el ID de los parámetros de la solicitud
  const vuelo = datos.vuelos.find(v => v.id === id); // Busca el vuelo por ID
  if (vuelo) {
    res.json(vuelo); // Responde con el vuelo encontrado
  } else {
    res.status(404).send("Vuelo no encontrado."); // Responde con error 404 si no se encuentra
  }
});

// Endpoint para agregar un nuevo vuelo
app.post('/AgregarVuelo', async (req, res) => {
  const nuevoVuelo = req.body; // Obtiene el nuevo vuelo del cuerpo de la solicitud

  // Asegurarse de que se incluye el avionId
  if (!nuevoVuelo.avionId) {
    return res.status(400).json({ error: 'El avionId es requerido' });
  }

  const datos = await leerDatos(); // Lee los datos del archivo
  const avion = datos.aviones.find(a => a.id === nuevoVuelo.avionId); // Busca el avión correspondiente

  // Verifica si el avión existe
  if (!avion) {
    return res.status(404).json({ error: 'Avión no encontrado' });
  }

  // Verifica el estado del avión
  if (avion.estado === "AVERIADO") {
    return res.status(400).json({ error: 'No se puede crear un vuelo con un avión en estado AVERIADO.' });
  }

  // Establece el límite de asientos del vuelo igual a la capacidad del avión
  nuevoVuelo.limiteAsientos = avion.capacidad; // Establece el límite de asientos al de la capacidad del avión

  nuevoVuelo.id = datos.vuelos.length ? datos.vuelos[datos.vuelos.length - 1].id + 1 : 1; // Asigna un nuevo ID al vuelo
  datos.vuelos.push(nuevoVuelo); // Agrega el nuevo vuelo a la lista

  await escribir(datos); // Guarda los datos actualizados
  res.status(201).json(nuevoVuelo); // Responde con el nuevo vuelo creado
});

// Endpoint para modificar un vuelo por ID
app.put('/ModificarVuelo/:id', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const id = parseInt(req.params.id); // Obtiene el ID de los parámetros de la solicitud
  const vuelo = datos.vuelos.find(v => v.id === id); // Busca el vuelo por ID
  if (vuelo) {
    Object.assign(vuelo, req.body); // Modifica el vuelo con los nuevos datos
    await escribir(datos); // Escribe los datos actualizados en el archivo
    res.json(vuelo); // Responde con el vuelo modificado
  } else {
    res.status(404).send('Vuelo no encontrado.'); // Responde con error 404 si no se encuentra
  }
});

// Endpoint para cambiar el estado de un vuelo por ID
app.delete('/EstadoVuelo/:id', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const id = parseInt(req.params.id); // Obtiene el ID de los parámetros de la solicitud
  const vuelo = datos.vuelos.find(v => v.id === id); // Busca el vuelo por ID
  
  if (vuelo) {
    // Cambia el estado del vuelo entre ACTIVO e INACTIVO
    vuelo.estado = (vuelo.estado === "INACTIVO") ? "ACTIVO" : "INACTIVO"; 
    await escribir(datos); // Escribe los datos actualizados en el archivo
    res.json({ message: `El vuelo ha cambiado a ${vuelo.estado}` }); // Responde con el nuevo estado del vuelo
  } else {
    res.status(404).send('Vuelo no encontrado.'); // Responde con error 404 si no se encuentra
  }
});

// ------------------- ASIENTOS -----------------------

// Endpoint para listar todos los asientos
app.get('/ListarAsientos', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  res.json(datos.asientos); // Responde con la lista de asientos en formato JSON
});

// Endpoint para listar asientos filtrados por clase
app.get('/ListarAsientosPorClase/:clase', async (req, res) => {
  const { clase } = req.params; // Obtiene la clase del parámetro de la ruta

  const datos = await leerDatos(); // Lee los datos del archivo
  const asientosFiltrados = datos.asientos.filter(a => a.clase === clase); // Filtra los asientos por clase

  res.json(asientosFiltrados); // Responde con la lista de asientos filtrados en formato JSON
});

// Endpoint para buscar un asiento por ID
app.get('/BuscarAsiento/:id', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const id = parseInt(req.params.id); // Obtiene el ID de los parámetros de la solicitud
  const asiento = datos.asientos.find(a => a.id === id); // Busca el asiento por ID
  if (asiento) {
    res.json(asiento); // Responde con el asiento encontrado
  } else {
    res.status(404).send("Asiento no encontrado."); // Responde con error 404 si no se encuentra
  }
});

// Endpoint para agregar un nuevo asiento
app.post('/AgregarAsiento', async (req, res) => {
  const nuevoAsiento = req.body; // Obtiene el nuevo asiento del cuerpo de la solicitud
  const datos = await leerDatos(); // Lee los datos del archivo

  // Obtener el vuelo al que pertenece el asiento
  const vuelo = datos.vuelos.find(v => v.id === nuevoAsiento.vueloId);

  if (!vuelo) {
    return res.status(404).send('Vuelo no encontrado.'); // Responde con error si el vuelo no existe
  }

  // Contar los asientos existentes para el vuelo
  const asientosDelVuelo = datos.asientos.filter(a => a.vueloId === vuelo.id);

  // Verificar si se supera el límite de asientos basado en la capacidad del vuelo
  if (asientosDelVuelo.length >= vuelo.limiteAsientos) {
    return res.status(400).send('El límite de asientos para este vuelo ha sido alcanzado.'); // Responde con error si se supera el límite
  }

  // Verificar si el asiento ya está reservado
  if (asientosDelVuelo.some(a => a.numero === nuevoAsiento.numero)) {
    return res.status(400).send('El asiento ya está reservado.'); // Responde con error si el asiento ya está reservado
  }

  nuevoAsiento.id = datos.asientos.length ? datos.asientos[datos.asientos.length - 1].id + 1 : 1; // Asigna un nuevo ID
  nuevoAsiento.estado = "SIN RESERVAR"; // Estado inicial cambiado a "SIN RESERVAR"
  nuevoAsiento.vueloId = vuelo.id; // Asegura que el asiento tenga el ID del vuelo
  datos.asientos.push(nuevoAsiento); // Agrega el nuevo asiento a la lista
  await escribir(datos); // Escribe los datos actualizados en el archivo
  res.status(201).json(nuevoAsiento); // Responde con el nuevo asiento creado
});

// Endpoint para modificar un asiento por ID
app.put('/ModificarAsiento/:id', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const id = parseInt(req.params.id); // Obtiene el ID de los parámetros de la solicitud
  const asiento = datos.asientos.find(a => a.id === id); // Busca el asiento por ID
  if (asiento) {
    Object.assign(asiento, req.body); // Modifica el asiento con los nuevos datos
    await escribir(datos); // Escribe los datos actualizados en el archivo
    res.json(asiento); // Responde con el asiento modificado
  } else {
    res.status(404).send('Asiento no encontrado.'); // Responde con error 404 si no se encuentra
  }
});

// Endpoint para cambiar el estado de un asiento por ID
app.delete('/EstadoAsiento/:id', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const id = parseInt(req.params.id); // Obtiene el ID de los parámetros de la solicitud
  const asiento = datos.asientos.find(a => a.id === id); // Busca el asiento por ID

  if (asiento) {
    // Cambia el estado del asiento entre RESERVADO y SIN RESERVAR
    asiento.estado = (asiento.estado === "SIN RESERVAR") ? "RESERVADO" : "SIN RESERVAR";
    await escribir(datos); // Escribe los datos actualizados en el archivo
    res.json({ message: `El asiento ha cambiado a ${asiento.estado}` }); // Responde con el nuevo estado del asiento
  } else {
    res.status(404).send('Asiento no encontrado.'); // Responde con error 404 si no se encuentra
  }
});

// ------------------- PAGOS -----------------------

// Endpoint para listar todos los pagos
app.get('/ListarPagos', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  res.json(datos.pagos); // Responde con la lista de pagos en formato JSON
});

// Endpoint para buscar un pago por ID
app.get('/BuscarPago/:id', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const id = parseInt(req.params.id); // Obtiene el ID de los parámetros de la solicitud
  const pago = datos.pagos.find(p => p.id === id); // Busca el pago por ID
  if (pago) {
    res.json(pago); // Responde con el pago encontrado
  } else {
    res.status(404).send('Pago no encontrado.'); // Responde con error 404 si no se encuentra
  }
});

// Endpoint para modificar un pago por ID
app.put('/ModificarPago/:id', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const id = parseInt(req.params.id); // Obtiene el ID de los parámetros de la solicitud
  const pago = datos.pagos.find(p => p.id === id); // Busca el pago por ID
  if (pago) {
    Object.assign(pago, req.body); // Modifica el pago con los nuevos datos
    await escribir(datos); // Escribe los datos actualizados en el archivo
    res.json(pago); // Responde con el pago modificado
  } else {
    res.status(404).send('Pago no encontrado.'); // Responde con error 404 si no se encuentra
  }
});

// Endpoint para realizar un nuevo pago (y reservar un asiento)
app.post('/RealizarPago', async (req, res) => {
  const { pasajeroId, vueloId, asientoId, metodoPago } = req.body; // Obtiene los datos del cuerpo de la solicitud
  const datos = await leerDatos(); // Lee los datos del archivo 

  const pasajero = datos.pasajeros.find(p => p.id === pasajeroId); // Busca al pasajero por ID
  const vuelo = datos.vuelos.find(v => v.id === vueloId); // Busca el vuelo por ID
  const asiento = datos.asientos.find(a => a.id === asientoId); // Busca el asiento por ID

  // Verifica si el pasajero, vuelo o asiento existen
  if (!pasajero || !vuelo || !asiento) {
    return res.status(400).send('Pasajero, vuelo o asiento no encontrado.'); // Responde con error si alguno no existe
  }

  // Verificar si ya existe un pago con el mismo asientoId
  const pagoExistente = datos.pagos.find(p => p.asientoId === asientoId);
  if (pagoExistente) {
    return res.status(400).send('El asiento ya ha sido reservado en un pago existente.'); // Responde con error si el asiento ya está reservado
  }

  // Marcar el asiento como reservado
  asiento.estado = "RESERVADO"; // Cambia el estado del asiento a reservado
  asiento.disponible = false; // Cambia la propiedad disponible a false
  await escribir(datos); // Guarda los cambios en los datos

  // Crear un nuevo pago
  const nuevoPago = {
    id: datos.pagos.length ? datos.pagos[datos.pagos.length - 1].id + 1 : 1, // Asigna un nuevo ID al pago
    pasajeroId, // ID del pasajero
    vueloId, // ID del vuelo
    asientoId, // ID del asiento
    metodoPago, // Método de pago
    fecha: new Date().toISOString(), // Fecha actual
    estado: "ACTIVO" // Estado inicial
  };

  datos.pagos.push(nuevoPago); // Agrega el nuevo pago a la lista
  await escribir(datos); // Escribe los datos actualizados en el archivo
  res.status(201).json(nuevoPago); // Responde con el nuevo pago creado
});

// Endpoint para cambiar el estado de un pago por ID
app.delete('/EstadoPago/:id', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const id = parseInt(req.params.id); // Obtiene el ID de los parámetros de la solicitud
  const pago = datos.pagos.find(p => p.id === id); // Busca el pago por ID
  
  if (pago) {
    // Cambia el estado del pago entre ACTIVO e INACTIVO
    pago.estado = (pago.estado === "INACTIVO") ? "ACTIVO" : "INACTIVO";
    await escribir(datos); // Escribe los datos actualizados en el archivo
    res.json({ message: `El pago ha cambiado a ${pago.estado}` }); // Responde con el nuevo estado del pago
  } else {
    res.status(404).send('Pago no encontrado.'); // Responde con error 404 si no se encuentra
  }
});

// ------------------- BOLETAS -----------------------

// Endpoint para listar todas las boletas
app.get('/ListarBoletas', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  res.json(datos.boletas); // Responde con la lista de boletas en formato JSON
});

// Endpoint para buscar una boleta por ID
app.get('/BuscarBoleta/:id', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const id = parseInt(req.params.id); // Obtiene el ID de los parámetros de la solicitud
  const boleta = datos.boletas.find(b => b.id === id); // Busca la boleta por ID
  if (boleta) {
    res.json(boleta); // Responde con la boleta encontrada
  } else {
    res.status(404).send('Boleta no encontrada.'); // Responde con error 404 si no se encuentra
  }
});

// Endpoint para generar una nueva boleta
app.post('/GenerarBoleta', async (req, res) => {
  const { pasajeroId, asientoId, vueloId } = req.body; // Obtiene los datos del cuerpo de la solicitud
  const datos = await leerDatos(); // Lee los datos del archivo

  // Busca al pasajero por ID
  const pasajero = datos.pasajeros.find(p => p.id === pasajeroId);
  // Busca el vuelo por ID
  const vuelo = datos.vuelos.find(v => v.id === vueloId);
  // Busca el asiento por ID
  const asiento = datos.asientos.find(a => a.id === asientoId);

  // Verifica si el pasajero, vuelo o asiento existen
  if (!pasajero || !vuelo || !asiento) {
    return res.status(400).send('Pasajero, vuelo o asiento no encontrado.'); // Responde con error si alguno no existe
  }

  // Verifica si ya existe una boleta para el asiento
  const boletaExistente = datos.boletas.find(b => b.num_asiento === asientoId);
  if (boletaExistente) {
    return res.status(400).send('El asiento ya ha sido utilizado en una boleta existente.'); // Responde con error si el asiento ya ha sido utilizado
  }

  // Crear una nueva boleta
  const boleta = {
    id: datos.boletas.length ? datos.boletas[datos.boletas.length - 1].id + 1 : 1, // Asigna un nuevo ID a la boleta
    nombre: pasajero.nombre, // Nombre del pasajero
    num_asiento: asiento.id, // Número del asiento
    clase: asiento.clase, // Clase del asiento
    precio: asiento.precio, // Precio del asiento
    vuelo_id: vuelo.id, // ID del vuelo
    horario: { // Horario del vuelo
      salida: vuelo.horario_salida, // Hora de salida
      llegada: vuelo.horario_llegada // Hora de llegada
    },
    lugar: { // Lugar del vuelo
      salida: vuelo.origen, // Ciudad de origen
      llegada: vuelo.destino // Ciudad de destino
    },
    estado: "COMPRADA", // Estado inicial cambiado a "COMPRADA"
    fecha_compra: new Date().toISOString() // Fecha actual de compra
  };

  datos.boletas.push(boleta); // Agrega la nueva boleta a la lista
  await escribir(datos); // Escribe los datos actualizados en el archivo
  res.status(201).json(boleta); // Responde con la nueva boleta creada
});

// Endpoint para modificar una boleta
app.put('/ModificarBoleta/:id', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const id = parseInt(req.params.id); // Obtiene el ID de los parámetros de la solicitud
  const boleta = datos.boletas.find(b => b.id === id); // Busca la boleta por ID
  if (boleta) {
    Object.assign(boleta, req.body); // Modifica la boleta con los nuevos datos
    await escribir(datos); // Escribe los datos actualizados en el archivo
    res.json(boleta); // Responde con la boleta modificada
  } else {
    res.status(404).send('Boleta no encontrada.'); // Responde con error 404 si no se encuentra
  }
});

// Endpoint para cambiar el estado de una boleta por ID
app.delete('/EstadoBoleta/:id', async (req, res) => {
  const datos = await leerDatos(); // Lee los datos del archivo
  const id = parseInt(req.params.id); // Obtiene el ID de los parámetros de la solicitud
  const boleta = datos.boletas.find(b => b.id === id); // Busca la boleta por ID
  
  if (boleta) {
    // Cambia el estado de la boleta entre ACTIVO e INACTIVO
    boleta.estado = (boleta.estado === "INACTIVO") ? "ACTIVO" : "INACTIVO";
    await escribir(datos); // Escribe los datos actualizados en el archivo
    res.json({ message: `La boleta ha cambiado a ${boleta.estado}` }); // Responde con el nuevo estado de la boleta
  } else {
    res.status(404).send('Boleta no encontrada.'); // Responde con error 404 si no se encuentra
  }
});


app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});