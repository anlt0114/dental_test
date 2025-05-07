export type RowData = {
  key: string;
  values: number[];
};
const DIVIDED_NUMBER = 3;

const getMaxStepToValues = (values: number[]) => {
  const halfLength = Math.floor(values.length / 2);
  const arrDistance = values.slice(0, halfLength).map((v) => Math.abs(v) * 10);
  const arrTemperature = values.slice(halfLength).map((v) => Math.abs(v));
  const pipeValues = [...arrDistance, ...arrTemperature];
  const maxValue = Math.max(...pipeValues);
  return Math.ceil(maxValue / DIVIDED_NUMBER);
};

const getMaxStepInputs = (inputs: RowData[]) => {
  const arrMaxStep = inputs.map((item) => getMaxStepToValues(item.values));
  const maxStep = Math.max(...arrMaxStep);
  return maxStep;
};

export default {
  DIVIDED_NUMBER,
  getMaxStepToValues,
  getMaxStepInputs,
};
