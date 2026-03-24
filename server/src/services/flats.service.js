import {
  getFlatsModel,
  createFlatModel,
  updateFlatModel,
  deleteFlatModel,
} from "../models/flats.model.js";

export const getFlatsService = async () => {
  return await getFlatsModel();
};

export const createFlatService = async (data) => {
  if (!data.flat_number) throw new Error("Flat Number is required");
  return await createFlatModel(data);
};

export const updateFlatService = async (id, data) => {
  if (!data.flat_number) throw new Error("Flat Number is required");
  return await updateFlatModel(id, data);
};

export const deleteFlatService = async (id) => {
  return await deleteFlatModel(id);
};
