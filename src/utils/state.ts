export type StateData = {
  time: number,
  dev_speed: number
}

export function getStateData(): StateData {
  const S: StateData = {
    time: 1,
    dev_speed: 0,
  };

  return S
}
