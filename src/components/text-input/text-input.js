export const TextInput = ({ onChange$, value }) => {
  console.log("text input binding", onChange$, value);
  return <input value={value} onChange={(e) => onChange$(e)}></input>;
};
