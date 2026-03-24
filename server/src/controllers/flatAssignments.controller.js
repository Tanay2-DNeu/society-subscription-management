import {
  assignResidentService,
  unassignResidentService,
  getFlatResidentsService,
} from "../services/flatAssignments.service.js";

export const assignResident = async (req, res) => {
  try {
    const flatId = req.params.id;
    const { user_id, role } = req.body;

    const result = await assignResidentService(flatId, user_id, role);

    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const unassignResident = async (req, res) => {
  try {
    const flatId = req.params.id;

    const result = await unassignResidentService(flatId);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFlatResidents = async (req, res) => {
  try {
    const flatId = req.params.id;

    const residents = await getFlatResidentsService(flatId);

    res.json(residents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
