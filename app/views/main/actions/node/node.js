export const SET_CPU_AMOUNT = 'SET_CPU_AMOUNT';
export const SET_MEMORY_AMOUNT = 'SET_MEMORY_AMOUNT';

export function setCPUAmount(amount) {
  return {
    type: SET_CPU_AMOUNT,
    amount
  };
}

export function setMemoryAmount(amount) {
  return {
    type: SET_MEMORY_AMOUNT,
    amount
  };
}
