export const useStep = () => {
  const dividedNumber = 3;

  // const inputs = [
  //   {
  //     key: "A1",
  //     values: [5, 3, 2, 45, -30, 10],
  //   },
  //   {
  //     key: "A2",
  //     values: [1, -2, 3, 45, 45, 45],
  //   },
  //   {
  //     key: "A3",
  //     values: [4, 1, 2, 45, 20, 10],
  //   },
  // ];

  const getMaxStepToValues = (values: number[]) => {
    const halfLength = Math.floor(values.length / 2);
    const arrDistance = values
      .slice(0, halfLength)
      .map((v) => Math.abs(v) * 10);
    const arrTemperature = values.slice(halfLength).map((v) => Math.abs(v));
    const pipeValues = [...arrDistance, ...arrTemperature];
    const maxValue = Math.max(...pipeValues);
    return Math.ceil(maxValue / dividedNumber);
  };

  const getMaxStepInputs = (inputs: any[]) => {
    const arrMaxStep = inputs.map((item) => getMaxStepToValues(item.value));
    const maxStep = Math.max(...arrMaxStep);
    return maxStep;
  };

  return { getMaxStepInputs };
};
