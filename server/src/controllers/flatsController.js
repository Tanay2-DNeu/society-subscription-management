import e from "cors";
import {
  getFlatsService,
  createFlatService,
  updateFlatService,
  deleteFlatService,
} from "../services/flats.service.js";

const validateFlatNumberOrThrow = (flat_number) => {
  if (flat_number === undefined || flat_number === null) {
    const err = new Error("Flat number is required");
    err.statusCode = 400;
    throw err;
  }

  const value = String(flat_number).trim();
  if (!value) {
    const err = new Error("Flat number is required");
    err.statusCode = 400;
    throw err;
  }

  if (!/^[0-9]+$/.test(value)) {
    const err = new Error("Flat number must be numeric");
    err.statusCode = 400;
    throw err;
  }

  if (parseInt(value, 10) <= 0) {
    const err = new Error("Flat number must be greater than 0");
    err.statusCode = 400;
    throw err;
  }

  return value;
};

const validateBlockOrThrow = (block) => {
  if (block === undefined || block === null) {
    const err = new Error("Block is required");
    err.statusCode = 400;
    throw err;
  }

  const value = String(block).trim();
  if (!value) {
    const err = new Error("Block is required");
    err.statusCode = 400;
    throw err;
  }

  return value;
};

const validateFloorOrThrow = (floor) => {
  if (floor === undefined || floor === null || floor === "") {
    const err = new Error("Floor is required");
    err.statusCode = 400;
    throw err;
  }

  const num = Number(floor);
  if (Number.isNaN(num)) {
    const err = new Error("Floor must be a number");
    err.statusCode = 400;
    throw err;
  }

  if (!Number.isInteger(num)) {
    const err = new Error("Floor must be a whole number");
    err.statusCode = 400;
    throw err;
  }

  if (num < 0) {
    const err = new Error("Floor must be 0 or greater");
    err.statusCode = 400;
    throw err;
  }

  return num;
};

const normalizeFlatTypeOrThrow = (reqBody) => {
  const incomingType = reqBody.flatType || reqBody.flat_type || reqBody.flattype;
  if (!incomingType || typeof incomingType !== "string") {
    const err = new Error("flatType is required");
    err.statusCode = 400;
    throw err;
  }

  const value = incomingType.toLowerCase();
  if (!["1bhk", "2bhk", "3bhk"].includes(value)) {
    const err = new Error("Invalid flat type");
    err.statusCode = 400;
    throw err;
  }

  return value;
};

export const getFlatData = async (req, res) => {
  try {
    const flats = await getFlatsService();
    res.json(flats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const createFlat = async (req, res) => {
  try {
    req.body.flat_number = validateFlatNumberOrThrow(req.body.flat_number);
    req.body.block = validateBlockOrThrow(req.body.block);
    req.body.floor = validateFloorOrThrow(req.body.floor);
    req.body.flattype = normalizeFlatTypeOrThrow(req.body);
    const flat = await createFlatService(req.body);
    res.status(201).json(flat);
  } catch (error) {
    console.error(error);
    if (error?.code === "23505") {
      return res.status(400).json({ message: "Flat already exists in this block" });
    }
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const updateFlat = async (req, res) => {
  try {
    console.log("Request body", req.body);
    console.log("Reuqest ID:", req.params.id);
    const { flat_number, block, floor } = req.body;

    const flat = await updateFlatService(req.params.id, {
      flat_number: validateFlatNumberOrThrow(flat_number),
      block: validateBlockOrThrow(block),
      floor: validateFloorOrThrow(floor),
      flattype: normalizeFlatTypeOrThrow(req.body),
    });
    res.status(201).json(flat);
  } catch (error) {
    console.error(error);
    if (error?.code === "23505") {
      return res.status(400).json({ message: "Flat already exists in this block" });
    }
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const deleteFlat = async (req, res) => {
  try {
    const result = await deleteFlatService(req.params.id);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
